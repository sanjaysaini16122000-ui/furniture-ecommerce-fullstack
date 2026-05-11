from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from products.models import Product

class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_cart(self, user):
        cart, created = Cart.objects.get_or_create(user=user)
        return cart

    def list(self, request):
        cart = self.get_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def create(self, request):
        """Maps to POST /api/cart/ — Add item to cart"""
        product_id = request.data.get("product")  # Frontend sends 'product'
        quantity = int(request.data.get("quantity", 1))

        try:
            product = Product.objects.get(id=product_id)
        except (Product.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        # Optional: Check stock if your model supports it
        # if getattr(product, 'stock', 999) < quantity:
        #     return Response({"error": "Not enough stock"}, status=status.HTTP_400_BAD_REQUEST)

        cart = self.get_cart(request.user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        
        cart_item.save()
        return Response({"message": "Item added to cart"}, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        """Maps to PATCH /api/cart/<item_id>/ — Update quantity"""
        quantity = request.data.get("quantity")
        if quantity is None:
            return Response({"error": "Quantity required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart_item = CartItem.objects.get(id=pk, cart__user=request.user)
            cart_item.quantity = int(quantity)
            cart_item.save()
            return Response({"message": "Quantity updated"})
        except (CartItem.DoesNotExist, ValueError):
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        """Maps to DELETE /api/cart/<item_id>/ — Remove item"""
        try:
            cart_item = CartItem.objects.get(id=pk, cart__user=request.user)
            cart_item.delete()
            return Response({"message": "Item removed"}, status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=["delete"])
    def clear(self, request):
        cart = self.get_cart(request.user)
        cart.items.all().delete()
        return Response({"message": "Cart cleared"}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"])
    def count(self, request):
        cart = self.get_cart(request.user)
        count = sum(item.quantity for item in cart.items.all())
        return Response({"count": count})
