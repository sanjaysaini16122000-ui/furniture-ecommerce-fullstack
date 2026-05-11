from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from .models import Order, OrderItem

class OrderItemInline(TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product", "quantity", "unit_price", "subtotal"]

@admin.register(Order)
class OrderAdmin(ModelAdmin):
    unfold_icon = "shopping_basket"
    list_display = ["order_number", "user", "status", "total", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["order_number", "user__email", "tracking_number"]
    inlines = [OrderItemInline]
    readonly_fields = ["order_number", "user", "shipping_address", "subtotal", "shipping_cost", "discount", "tax", "total", "created_at", "updated_at"]
