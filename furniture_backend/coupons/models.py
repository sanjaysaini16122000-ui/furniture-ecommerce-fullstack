from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = (
        ("fixed", "Fixed Amount"),
        ("percentage", "Percentage"),
    )

    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, default="fixed")
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    
    min_purchase_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    
    usage_limit = models.PositiveIntegerField(null=True, blank=True, help_text="Total times this coupon can be used")
    used_count = models.PositiveIntegerField(default=0)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code

    @property
    def is_valid(self):
        now = timezone.now()
        if not self.is_active:
            return False
        if now < self.start_date or now > self.end_date:
            return False
        if self.usage_limit and self.used_count >= self.usage_limit:
            return False
        return True

    def calculate_discount(self, purchase_amount):
        if purchase_amount < self.min_purchase_amount:
            return 0
        
        if self.discount_type == "fixed":
            discount = self.discount_value
        else:
            discount = (self.discount_value / 100) * purchase_amount
            
        if self.max_discount_amount:
            discount = min(discount, self.max_discount_amount)
            
        return min(discount, purchase_amount) # Discount can't exceed purchase amount
