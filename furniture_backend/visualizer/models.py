from django.db import models
from django.conf import settings
from products.models import Product

class UserVisualization(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="visualizations")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="visualizations")
    room_image = models.ImageField(upload_to="visualizations/")
    
    # Coordinates and scale for the overlay
    x_pos = models.DecimalField(max_digits=10, decimal_places=4, default=0.5) # 0.0 to 1.0 (relative)
    y_pos = models.DecimalField(max_digits=10, decimal_places=4, default=0.5)
    scale = models.DecimalField(max_digits=10, decimal_places=4, default=1.0)
    rotation = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Viz by {self.user.email} - {self.product.name}"
