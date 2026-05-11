from rest_framework import serializers
from .models import CustomUser

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id", "email", "first_name", "last_name", "is_staff", 
            "is_active", "created_at", "is_verified"
        ]
        read_only_fields = ["id", "created_at"]
