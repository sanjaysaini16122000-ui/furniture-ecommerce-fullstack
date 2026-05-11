from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Review

@admin.register(Review)
class ReviewAdmin(ModelAdmin):
    unfold_icon = "reviews"
    list_display = ["product", "user", "rating", "created_at"]
    list_filter = ["rating", "created_at"]
    search_fields = ["product__name", "user__email", "comment"]
