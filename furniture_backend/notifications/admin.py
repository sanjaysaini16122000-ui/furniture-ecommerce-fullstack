from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(ModelAdmin):
    unfold_icon = "notifications"
    list_display = ["user", "type", "title", "is_read", "created_at"]
    list_filter = ["type", "is_read", "created_at"]
    search_fields = ["user__email", "title", "message"]
    readonly_fields = ["created_at"]
