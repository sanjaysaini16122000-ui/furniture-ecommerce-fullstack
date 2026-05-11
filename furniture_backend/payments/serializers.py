from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]

class PaymentInitializeSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=["simulated", "cod", "stripe", "online", "razorpay"], required=False, default="simulated")



class PaymentVerifySerializer(serializers.Serializer):
    transaction_id = serializers.CharField(required=False)
    order_id = serializers.IntegerField(required=False)
    session_id = serializers.CharField(required=False)
