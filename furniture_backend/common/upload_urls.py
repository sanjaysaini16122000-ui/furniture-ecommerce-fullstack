from django.urls import path
from .upload_views import ImageUploadView

urlpatterns = [
    path("", ImageUploadView.as_view(), name="image-upload"),
]
