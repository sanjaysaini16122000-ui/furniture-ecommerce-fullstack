from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from .models import Cart, CartItem

class CartItemInline(TabularInline):
    model = CartItem
    extra = 0

@admin.register(Cart)
class CartAdmin(ModelAdmin):
    unfold_icon = "shopping_cart"
    list_display = ["user", "created_at", "total_price"]
    search_fields = ["user__email"]
    inlines = [CartItemInline]
