from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductListSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "quantity", "unit_price", "subtotal"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    invoice_url = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id", "user", "order_number", "status", "shipping_address",
            "subtotal", "shipping_cost", "discount", "tax", "total",
            "tracking_number", "created_at", "items", "invoice_url",
            "coupon", "discount_amount", "payment_method", "payment_status"
        ]
        read_only_fields = ["order_number", "status", "subtotal", "total", "discount_amount"]

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "email": obj.user.email,
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name,
        }

    def get_invoice_url(self, obj):
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(f"/api/orders/{obj.id}/invoice/")
        return f"/api/orders/{obj.id}/invoice/"


class AdminOrderSerializer(OrderSerializer):
    class Meta(OrderSerializer.Meta):
        read_only_fields = ["order_number", "subtotal", "total", "discount_amount"]



class OrderItemCreateSerializer(serializers.Serializer):
    product = serializers.IntegerField() # Product ID
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

class OrderCreateSerializer(serializers.Serializer):
    # Support both existing address ID or new address details
    shipping_address_id = serializers.IntegerField(required=False)
    
    # Raw address details from frontend form
    shipping_address = serializers.CharField(required=False)
    phone_number = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    customer_name = serializers.CharField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    payment_method = serializers.CharField(required=False)
    
    # New fields to match frontend Checkout.jsx
    items = OrderItemCreateSerializer(many=True, required=False)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    
    coupon_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
