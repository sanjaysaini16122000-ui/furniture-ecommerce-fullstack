from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.template.loader import get_template
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from xhtml2pdf import pisa
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer, AdminOrderSerializer
from cart.models import Cart
from accounts.models import Address
from coupons.models import Coupon
from products.models import Product
from notifications.emails import build_order_confirmation_email

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'is_staff', False):
            return Order.objects.all()
        return Order.objects.filter(user=user)

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        if getattr(self.request.user, 'is_staff', False):
            return AdminOrderSerializer
        return OrderSerializer

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def all(self, request):
        """
        API endpoint that allows admin users to view all orders.
        """
        queryset = Order.objects.all().order_by('-created_at')
        
        # Apply filtering if needed (optional, matches frontend params)
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"[DEBUG ORDER] Request data: {request.data}")
        
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"[DEBUG ORDER] Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        logger.error(f"[DEBUG ORDER] Validated data: {serializer.validated_data}")
        
        user = request.user
        address_id = serializer.validated_data.get("shipping_address_id")
        
        # Determine Shipping Address
        shipping_address = None
        if address_id:
            try:
                shipping_address = Address.objects.get(id=address_id, user=user)
            except Address.DoesNotExist:
                logger.error("[DEBUG ORDER] Invalid shipping address ID")
                return Response({"error": "Invalid shipping address ID"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not shipping_address:
            address_str = serializer.validated_data.get("shipping_address")
            if address_str:
                shipping_address = Address.objects.create(
                    user=user,
                    label="Shipping Address",
                    street=address_str,
                    city="Default City",
                    state="Default State",
                    pincode="000000",
                    country="Default Country"
                )
                logger.error(f"[DEBUG ORDER] Created address: {shipping_address.id}")
            else:
                shipping_address = Address.objects.filter(user=user).first()
        
        if not shipping_address:
            logger.error("[DEBUG ORDER] No shipping address found")
            return Response({"error": "Shipping address is required."}, status=status.HTTP_400_BAD_REQUEST)

        logger.error(f"[DEBUG ORDER] Using address: {shipping_address.id}")

        # Source of items
        request_items = serializer.validated_data.get("items")
        subtotal = 0
        order_items_to_create = []

        if request_items:
            for item_data in request_items:
                try:
                    product = Product.objects.get(id=item_data["product"])
                except Product.DoesNotExist:
                    logger.error(f"[DEBUG ORDER] Product {item_data['product']} not found")
                    return Response({"error": f"Product {item_data['product']} not found"}, status=status.HTTP_400_BAD_REQUEST)
                
                logger.error(f"[DEBUG ORDER] Product found: {product.name}, stock: {product.stock}")
                
                if product.stock < item_data["quantity"]:
                    logger.error(f"[DEBUG ORDER] Not enough stock for {product.name}")
                    return Response({"error": f"Not enough stock for {product.name}"}, status=status.HTTP_400_BAD_REQUEST)
                
                price = product.discount_price if product.discount_price else product.price
                subtotal += price * item_data["quantity"]
                order_items_to_create.append({
                    "product": product,
                    "quantity": item_data["quantity"],
                    "unit_price": price
                })
        else:
            try:
                cart = Cart.objects.get(user=user)
                if not cart.items.exists():
                    logger.error("[DEBUG ORDER] Cart is empty")
                    return Response({"error": "No items found in cart or request"}, status=status.HTTP_400_BAD_REQUEST)
                
                for cart_item in cart.items.all():
                    product = cart_item.product
                    if product.stock < cart_item.quantity:
                        logger.error(f"[DEBUG ORDER] Not enough stock for {product.name}")
                        return Response({"error": f"Not enough stock for {product.name}"}, status=status.HTTP_400_BAD_REQUEST)
                    
                    price = product.discount_price if product.discount_price else product.price
                    subtotal += price * cart_item.quantity
                    order_items_to_create.append({
                        "product": product,
                        "quantity": cart_item.quantity,
                        "unit_price": price
                    })
            except Cart.DoesNotExist:
                logger.error("[DEBUG ORDER] Cart does not exist")
                return Response({"error": "Cart is empty and no items provided"}, status=status.HTTP_400_BAD_REQUEST)

        if not order_items_to_create:
            logger.error("[DEBUG ORDER] No items to create")
            return Response({"error": "Cannot create order with no items"}, status=status.HTTP_400_BAD_REQUEST)
        
        logger.error(f"[DEBUG ORDER] Items ready: {len(order_items_to_create)}, subtotal: {subtotal}")

        # Coupon Logic
        coupon = None
        discount_amount = 0
        coupon_code = serializer.validated_data.get("coupon_code")
        
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code)
                if coupon.is_valid and subtotal >= coupon.min_purchase_amount:
                    discount_amount = coupon.calculate_discount(subtotal)
                else:
                    return Response(
                        {"error": "Coupon is invalid, expired, or minimum purchase amount not met."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Coupon.DoesNotExist:
                return Response({"error": "Invalid coupon code"}, status=status.HTTP_400_BAD_REQUEST)

        # Totals
        shipping_cost = 0 
        tax = subtotal * 0 
        total = subtotal + shipping_cost + tax - discount_amount

        # Payment method
        payment_method = serializer.validated_data.get("payment_method", "COD").upper()
        if payment_method not in ("COD", "ONLINE"):
            payment_method = "COD"

        # Create Order
        order = Order.objects.create(
            user=user,
            shipping_address=shipping_address,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax=tax,
            total=total,
            coupon=coupon,
            discount_amount=discount_amount,
            status="pending",
            payment_method=payment_method,
            payment_status="unpaid"
        )

        # Create Order Items & Update Stock
        for item_data in order_items_to_create:
            OrderItem.objects.create(order=order, **item_data)
            # Update stock
            product = item_data["product"]
            product.stock -= item_data["quantity"]
            product.save()

        # Update Coupon usage
        if coupon:
            coupon.used_count += 1
            coupon.save()

        # Clear Cart (Safely)
        try:
            cart = Cart.objects.get(user=user)
            cart.items.all().delete()
        except Cart.DoesNotExist:
            pass

        # Send order confirmation email directly (no Celery needed)
        try:
            subject, message, recipient_list = build_order_confirmation_email(order)
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipient_list,
                fail_silently=False,
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send order confirmation email: {str(e)}")

        # Return the created order
        order_serializer = OrderSerializer(order)
        return Response(order_serializer.data, status=status.HTTP_201_CREATED)


class DownloadInvoiceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)
        template_path = "orders/invoice.html"
        context = {"order": order}
        
        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="invoice_{order.order_number}.pdf"'
        
        template = get_template(template_path)
        html = template.render(context)

        # Create a PDF
        pisa_status = pisa.CreatePDF(html, dest=response)
        
        if pisa_status.err:
            return Response({"error": "Failed to generate PDF"}, status=500)
        return response
