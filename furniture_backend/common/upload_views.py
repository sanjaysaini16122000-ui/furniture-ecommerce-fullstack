import os
from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.conf import settings
from django.core.files.storage import default_storage

class ImageUploadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        if "image" not in request.FILES:
            return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.FILES["image"]
        
        # Save to media/uploads/
        file_path = f"uploads/{image_file.name}"
        stored_path = default_storage.save(file_path, image_file)
        
        # Build absolute URL
        request_obj = request._request
        url = request_obj.build_absolute_uri(settings.MEDIA_URL + stored_path)

        return Response({
            "image": url,
            "url": url,
            "success": True
        }, status=status.HTTP_201_CREATED)
