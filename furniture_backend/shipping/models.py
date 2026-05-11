from django.db import models
from django.core.validators import MinValueValidator

class ShippingMethod(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    base_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0)]
    )
    
    estimated_delivery_days = models.PositiveIntegerField(
        help_text="Minimum estimated delivery days"
    )
    max_estimated_delivery_days = models.PositiveIntegerField(
        help_text="Maximum estimated delivery days",
        null=True, blank=True
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["base_cost"]

    def __str__(self):
        return self.name

    def calculate_cost(self, order_total=0, order_weight=0):
        # Placeholder for complex logic (e.g. weight-based or free shipping above a threshold)
        # For now, just return the base cost
        return self.base_cost
