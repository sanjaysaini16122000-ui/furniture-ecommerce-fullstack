from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShippingMethodViewSet

router = DefaultRouter()
router.register(r"methods", ShippingMethodViewSet, basename="shipping-method")

urlpatterns = [
    path("", include(router.urls)),
]
