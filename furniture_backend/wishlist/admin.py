from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import WishlistItem

@admin.register(WishlistItem)
class WishlistItemAdmin(ModelAdmin):
    unfold_icon = "favorite"
    list_display = ["user", "product", "added_at"]
    search_fields = ["user__email", "product__name"]
