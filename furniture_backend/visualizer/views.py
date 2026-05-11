import requests
import base64
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from products.models import Product
from .models import UserVisualization
from .serializers import VisualizationSerializer

class VisualizationViewSet(viewsets.ModelViewSet):
    serializer_class = VisualizationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserVisualization.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RemoveBackgroundView(APIView):
    permission_classes = [permissions.AllowAny]


    def post(self, request):
        product_id = request.data.get("product_id")
        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
            # Get the primary image or first available image

            primary_image = product.images.filter(is_primary=True).first() or product.images.first()
            if not primary_image:
                 return Response({"error": "Product has no images to extract"}, status=status.HTTP_400_BAD_REQUEST)
            
            image_url = request.build_absolute_uri(primary_image.image.url)

            
            if not settings.REMOVE_BG_API_KEY:
                return Response({
                    "error": "AI Extraction not configured. Please add REMOVE_BG_API_KEY to environment.",
                    "is_configured": False
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            # Call Remove.bg API with file upload instead of URL (since URL might be localhost)
            with open(primary_image.image.path, "rb") as image_file:
                response = requests.post(
                    "https://api.remove.bg/v1.0/removebg",
                    files={"image_file": image_file},
                    data={"size": "auto"},
                    headers={"X-Api-Key": settings.REMOVE_BG_API_KEY},
                )


            if response.status_code == requests.codes.ok:
                # Return base64 for easy frontend rendering
                img_base64 = base64.b64encode(response.content).decode("utf-8")
                return Response({
                    "image": f"data:image/png;base64,{img_base64}",
                    "message": "Background removed successfully"
                })
            else:
                return Response({
                    "error": f"AI API Error: {response.text}",
                    "status_code": response.status_code
                }, status=status.HTTP_424_FAILED_DEPENDENCY)

        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
