from rest_framework import serializers
from .models import WishlistItem
from products.models import Product
from products.serializers import ProductListSerializer

class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source="product", write_only=True
    )

    class Meta:
        model = WishlistItem
        fields = ["id", "product", "product_id", "added_at"]

    def create(self, validated_data):
        user = self.context["request"].user
        return WishlistItem.objects.create(user=user, **validated_data)
