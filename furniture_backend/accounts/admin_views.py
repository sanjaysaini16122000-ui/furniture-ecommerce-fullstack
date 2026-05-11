from rest_framework import viewsets, permissions
from .models import CustomUser
from .admin_serializers import AdminUserSerializer

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all().order_by("-created_at")
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
