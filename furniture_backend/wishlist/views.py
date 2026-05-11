from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import WishlistItem
from .serializers import WishlistItemSerializer
from cart.models import Cart, CartItem
from products.models import Product

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        # The frontend sends 'product' but the serializer expects 'product_id'
        # We handle both for compatibility
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        if "product" in data and "product_id" not in data:
            data["product_id"] = data["product"]
        
        product_id = data.get("product_id")
        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already in wishlist
        if WishlistItem.objects.filter(user=request.user, product_id=product_id).exists():
            return Response({"message": "Item already in wishlist"}, status=status.HTTP_200_OK)
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="move-to-cart")
    def move_to_cart(self, request, pk=None):
        wishlist_item = self.get_object()
        product = wishlist_item.product

        # Check stock
        if product.stock < 1:
            return Response({"error": "Product out of stock"}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create cart
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        # Add to cart
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            cart_item.quantity += 1
        else:
            cart_item.quantity = 1
        cart_item.save()

        # Remove from wishlist
        wishlist_item.delete()

        return Response({"message": "Moved to cart successfully"}, status=status.HTTP_200_OK)
