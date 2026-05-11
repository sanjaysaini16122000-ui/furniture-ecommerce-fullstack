from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, FeaturedProductsView

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"", ProductViewSet, basename="product")

urlpatterns = [
    path("featured/", FeaturedProductsView.as_view(), name="featured-products"),
    path("", include(router.urls)),
]
