from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from orders.models import Order, OrderItem
from products.models import Product, Category
from accounts.models import Address
from coupons.models import Coupon
from cart.models import Cart, CartItem
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

@override_settings(CELERY_TASK_ALWAYS_EAGER=True, CELERY_TASK_EAGER_PROPAGATES=True)
class InvoiceTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="test@example.com", password="password123")
        self.client.force_authenticate(user=self.user)
        
        self.category = Category.objects.create(name="Furniture", slug="furniture")
        self.product = Product.objects.create(
            name="Test Chair", slug="test-chair", price=100.00, sku="CH-01", category=self.category, stock=10
        )
        self.address = Address.objects.create(
            user=self.user, label="Home", street="123 Street", city="City", state="State", pincode="123456", country="Country"
        )
        
        self.order = Order.objects.create(
            user=self.user, 
            shipping_address=self.address,
            subtotal=100.00,
            shipping_cost=0.00,
            tax=0.00,
            total=100.00
        )
        self.order_item = OrderItem.objects.create(
            order=self.order, product=self.product, quantity=1, unit_price=100.00
        )

    def test_download_invoice(self):
        url = reverse("order-invoice", kwargs={"pk": self.order.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertIn(f"invoice_{self.order.order_number}.pdf", response["Content-Disposition"])

    def test_order_serializer_includes_invoice_url(self):
        url = reverse("order-detail", kwargs={"pk": self.order.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("invoice_url", response.data)
        self.assertIn(f"/api/orders/{self.order.id}/invoice/", response.data["invoice_url"])

@override_settings(CELERY_TASK_ALWAYS_EAGER=True, CELERY_TASK_EAGER_PROPAGATES=True)
class OrderCouponTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="buyer@example.com", password="password123")
        self.client.force_authenticate(user=self.user)
        
        self.category = Category.objects.create(name="Furniture", slug="furniture")
        self.product = Product.objects.create(
            name="Sofa", slug="sofa", price=1000.00, sku="SOFA-01", category=self.category, stock=5
        )
        self.address = Address.objects.create(
            user=self.user, label="Office", street="456 Blvd", city="City", state="State", pincode="654321", country="Country"
        )
        
        # Setup Cart
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=1)
        
        # Setup Coupons
        self.fixed_coupon = Coupon.objects.create(
            code="FIXED200",
            discount_type="fixed",
            discount_value=200.00,
            start_date=timezone.now() - timedelta(days=1),
            end_date=timezone.now() + timedelta(days=1),
            is_active=True
        )
        self.percent_coupon = Coupon.objects.create(
            code="PERCENT10",
            discount_type="percentage",
            discount_value=10.00,
            start_date=timezone.now() - timedelta(days=1),
            end_date=timezone.now() + timedelta(days=1),
            is_active=True
        )

    def test_checkout_with_fixed_coupon(self):
        url = reverse("order-list")
        data = {
            "shipping_address_id": self.address.id,
            "coupon_code": "FIXED200"
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(float(response.data["subtotal"]), 1000.00)
        self.assertEqual(float(response.data["discount_amount"]), 200.00)
        self.assertEqual(float(response.data["total"]), 800.00)
        
        # Check usage count
        self.fixed_coupon.refresh_from_db()
        self.assertEqual(self.fixed_coupon.used_count, 1)

    def test_checkout_with_percentage_coupon(self):
        url = reverse("order-list")
        data = {
            "shipping_address_id": self.address.id,
            "coupon_code": "PERCENT10"
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(float(response.data["discount_amount"]), 100.00) # 10% of 1000
        self.assertEqual(float(response.data["total"]), 900.00)

    def test_checkout_with_invalid_coupon(self):
        url = reverse("order-list")
        data = {
            "shipping_address_id": self.address.id,
            "coupon_code": "INVALID"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Invalid coupon code")
