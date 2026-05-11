from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(ModelAdmin):
    unfold_icon = "payments"
    list_display = ["id", "order", "user", "payment_method", "amount", "status", "created_at"]
    list_filter = ["status", "payment_method", "created_at"]
    search_fields = ["transaction_id", "order__order_number", "user__email"]
    readonly_fields = ["transaction_id", "provider_order_id", "amount", "created_at", "updated_at"]
