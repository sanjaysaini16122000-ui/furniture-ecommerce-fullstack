from django.contrib import admin
from .models import UserVisualization

@admin.register(UserVisualization)
class UserVisualizationAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__email", "product__name")
