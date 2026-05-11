from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, DownloadInvoiceView

router = DefaultRouter()
router.register(r"", OrderViewSet, basename="order")

urlpatterns = [
    path("all/", OrderViewSet.as_view({'get': 'all'}), name="order-all"),
    path("", include(router.urls)),
    path("<int:pk>/invoice/", DownloadInvoiceView.as_view(), name="order-invoice"),
]
