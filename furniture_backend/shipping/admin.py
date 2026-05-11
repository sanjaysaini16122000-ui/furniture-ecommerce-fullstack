from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import ShippingMethod

@admin.register(ShippingMethod)
class ShippingMethodAdmin(ModelAdmin):
    unfold_icon = "local_shipping"
    list_display = ["name", "base_cost", "estimated_delivery_days", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["name"]
