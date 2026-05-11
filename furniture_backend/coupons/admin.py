from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Coupon

@admin.register(Coupon)
class CouponAdmin(ModelAdmin):
    unfold_icon = "local_offer"
    list_display = ["code", "discount_type", "discount_value", "is_active", "start_date", "end_date", "used_count"]
    list_filter = ["is_active", "discount_type", "start_date", "end_date"]
    search_fields = ["code"]
