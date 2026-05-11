from rest_framework import viewsets, generics, filters, permissions
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product
from .serializers import (
    CategorySerializer, ProductListSerializer, 
    ProductDetailSerializer, ProductCreateUpdateSerializer
)
from common.permissions import IsAdminUserOrReadOnly

class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUserOrReadOnly]
    queryset = Category.objects.filter(parent__isnull=True).order_by('id')
    serializer_class = CategorySerializer


from .filters import ProductFilter

class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUserOrReadOnly]
    queryset = Product.objects.all().order_by('id')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ["name", "description", "sku", "material"]
    ordering_fields = ["price", "created_at"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"DEBUG: Product Validation Errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)

    def get_serializer_class(self):
        if self.action == "list":
            return ProductListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer


class FeaturedProductsView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Product.objects.filter(is_featured=True, is_available=True).order_by('id')[:10]
    serializer_class = ProductListSerializer
