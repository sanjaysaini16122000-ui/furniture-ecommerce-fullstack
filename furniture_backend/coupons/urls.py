from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CouponViewSet, ValidateCouponView

router = DefaultRouter()
router.register(r"list", CouponViewSet, basename="coupon")

urlpatterns = [
    path("validate/", ValidateCouponView.as_view(), name="validate-coupon"),
    path("", include(router.urls)),
]
