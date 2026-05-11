from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Coupon
from .serializers import CouponSerializer, CouponApplySerializer
from cart.models import Cart
from django.utils import timezone

class CouponViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Coupon.objects.filter(is_active=True)
    serializer_class = CouponSerializer


class ValidateCouponView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CouponApplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data["code"]
        
        try:
            coupon = Coupon.objects.get(code__iexact=code)
        except Coupon.DoesNotExist:
            return Response({"error": "Invalid coupon code"}, status=status.HTTP_404_NOT_FOUND)
            
        if not coupon.is_valid:
            return Response({"error": "Coupon has expired or reached usage limit"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Get cart total to check min_purchase_amount
        try:
            cart = Cart.objects.get(user=request.user)
            cart_total = cart.total_price
        except Cart.DoesNotExist:
            return Response({"error": "Cart not found"}, status=status.HTTP_400_BAD_REQUEST)
            
        if cart_total < coupon.min_purchase_amount:
            return Response({
                "error": f"Minimum purchase amount of {coupon.min_purchase_amount} required to use this coupon"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        discount = coupon.calculate_discount(cart_total)
        
        return Response({
            "message": "Coupon valid",
            "code": coupon.code,
            "discount_amount": discount,
            "new_total": cart_total - discount
        })
