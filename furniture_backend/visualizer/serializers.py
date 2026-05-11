from rest_framework import serializers
from .models import UserVisualization
from products.serializers import ProductSerializer

class VisualizationSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source="product", read_only=True)

    class Meta:
        model = UserVisualization
        fields = ["id", "user", "product", "product_details", "room_image", "x_pos", "y_pos", "scale", "rotation", "created_at"]
        read_only_fields = ["user", "created_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
