from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import CustomUser, Address

@admin.register(CustomUser)
class CustomUserAdmin(ModelAdmin):
    unfold_icon = "people"
    list_display = ["email", "first_name", "last_name", "is_verified", "is_staff", "is_active"]
    search_fields = ["email", "first_name", "last_name"]
    list_filter = ["is_verified", "is_staff", "is_active"]

@admin.register(Address)
class AddressAdmin(ModelAdmin):
    unfold_icon = "home"
    list_display = ["user", "label", "city", "state", "pincode"]
    search_fields = ["user__email", "city", "pincode"]
