from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisualizationViewSet, RemoveBackgroundView

router = DefaultRouter()
router.register(r'', VisualizationViewSet, basename='visualization')

urlpatterns = [
    path('remove-bg/', RemoveBackgroundView.as_view(), name='remove-bg'),
    path('', include(router.urls)),
]
