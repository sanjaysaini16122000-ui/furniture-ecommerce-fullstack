from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from .models import Category, Product, ProductImage

@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    unfold_icon = "category"
    list_display = ["name", "parent", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name"]

class ProductImageInline(TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(ModelAdmin):
    unfold_icon = "inventory_2"
    list_display = ["name", "category", "price", "discount_price", "stock", "is_available", "is_featured"]
    list_filter = ["is_available", "is_featured", "category"]
    search_fields = ["name", "sku", "description"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline]
