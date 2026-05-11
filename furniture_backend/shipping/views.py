from rest_framework import viewsets, permissions
from .models import ShippingMethod
from .serializers import ShippingMethodSerializer

class ShippingMethodViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = ShippingMethod.objects.filter(is_active=True)
    serializer_class = ShippingMethodSerializer
