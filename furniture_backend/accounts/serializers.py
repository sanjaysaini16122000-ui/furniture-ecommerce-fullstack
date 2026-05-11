from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .models import CustomUser, Address


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["email", "first_name", "last_name", "password"]

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(email=data["email"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        if not user.is_active:
             raise serializers.ValidationError("User is disabled")
        return user


class ProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=100, allow_blank=True, required=False)
    last_name = serializers.CharField(max_length=100, allow_blank=True, required=False)

    class Meta:
        model = CustomUser
        fields = ["id", "email", "first_name", "last_name", "phone", "avatar"]
        read_only_fields = ["email"]

    def to_internal_value(self, data):
        # Handle cases where frontend sends string (URL, empty string, or 'null') for avatar ImageField
        # Also handle splitting 'full_name' into first/last name
        # Use a shallow copy instead of deepcopy to avoid pickling issues with file handles
        if hasattr(data, 'dict'):
            mutable_data = data.dict()
        else:
            mutable_data = dict(data)
        
        # Handle 'full_name' if sent instead of first_name/last_name
        full_name = mutable_data.get('full_name')
        if full_name is not None:
             if isinstance(full_name, list) and len(full_name) > 0:
                 full_name = full_name[0]
             
             if isinstance(full_name, str):
                 parts = full_name.strip().split(' ', 1)
                 mutable_data['first_name'] = parts[0]
                 mutable_data['last_name'] = parts[1] if len(parts) > 1 else ""
                 # Don't delete full_name yet, DRF might still use it if it's in fields (it's not but safer)

        if 'avatar' in mutable_data:
            avatar_val = mutable_data['avatar']
            # If it's a list (from QueryDict and HTML array), take first item
            if isinstance(avatar_val, list) and len(avatar_val) > 0:
                avatar_val = avatar_val[0]

            if isinstance(avatar_val, str):
                if avatar_val in ['null', 'undefined', '']:
                    mutable_data['avatar'] = None
                elif avatar_val.startswith('http') or avatar_val.startswith('/'):
                    # Frontend sent the existing url, exclude it from update so ImageField does not complain
                    del mutable_data['avatar']
                    
        return super().to_internal_value(mutable_data)


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "label", "street", "city", "state", "pincode", "country", "is_default"]

    def create(self, validated_data):
        user = self.context["request"].user
        return Address.objects.create(user=user, **validated_data)


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs["refresh"]
        return attrs

    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()
        except TokenError:
            raise serializers.ValidationError({"refresh": "Token is invalid or expired"})


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    class Meta:
        fields = ["email"]


class SetNewPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    token = serializers.CharField(write_only=True)
    uidb64 = serializers.CharField(write_only=True)

    class Meta:
        fields = ["password", "token", "uidb64"]


