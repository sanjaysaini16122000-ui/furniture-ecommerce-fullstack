from django_filters import rest_framework as filters
from .models import Product, Category

class ProductFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")
    category = filters.CharFilter(method="filter_by_category")

    class Meta:
        model = Product
        fields = ["is_featured", "is_available", "material"]

    def filter_by_category(self, queryset, name, value):
        """
        Filter products by category slug. Includes products from subcategories.
        """
        try:
            category = Category.objects.get(slug=value)
            # Get all subcategory IDs recursively
            def get_subcategories(cat):
                sub_ids = [cat.id]
                for sub in cat.subcategories.all():
                    sub_ids.extend(get_subcategories(sub))
                return sub_ids

            category_ids = get_subcategories(category)
            return queryset.filter(category_id__in=category_ids)
        except Category.DoesNotExist:
            return queryset.none()
