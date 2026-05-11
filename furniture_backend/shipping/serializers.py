from rest_framework import serializers
from .models import ShippingMethod

class ShippingMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingMethod
        fields = [
            "id", "name", "description", "base_cost", 
            "estimated_delivery_days", "max_estimated_delivery_days"
        ]
