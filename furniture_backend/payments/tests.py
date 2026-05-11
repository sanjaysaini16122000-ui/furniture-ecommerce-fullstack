from django.test import TestCase
from django.contrib.auth import get_user_model
from orders.models import Order
from payments.models import Payment
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class PaymentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="test@example.com", password="password123")
        self.client.force_authenticate(user=self.user)
        self.order = Order.objects.create(
            user=self.user,
            total=100.00,
            subtotal=100.00,
            status="pending"
        )

    def test_payment_initialization(self):
        response = self.client.post("/api/payments/initialize/", {
            "order_id": self.order.id,
            "payment_method": "simulated"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Payment.objects.count(), 1)
        self.assertEqual(Payment.objects.first().status, "pending")

    def test_payment_verification_simulated(self):
        # Initialize
        self.client.post("/api/payments/initialize/", {
            "order_id": self.order.id,
            "payment_method": "simulated"
        })
        
        # Verify
        response = self.client.post("/api/payments/verify/", {
            "order_id": self.order.id,
            "transaction_id": "TXN12345"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check updates
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "confirmed")
        
        payment = Payment.objects.first()
        self.assertEqual(payment.status, "completed")
        self.assertEqual(payment.transaction_id, "TXN12345")

    def test_payment_verification_cod(self):
        # Initialize
        self.client.post("/api/payments/initialize/", {
            "order_id": self.order.id,
            "payment_method": "cod"
        })
        
        # Verify
        response = self.client.post("/api/payments/verify/", {
            "order_id": self.order.id,
            "transaction_id": "dummy"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check updates
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "confirmed")
        
        payment = Payment.objects.first()
        self.assertEqual(payment.status, "pending")
        self.assertTrue(payment.transaction_id.startswith("COD-"))
