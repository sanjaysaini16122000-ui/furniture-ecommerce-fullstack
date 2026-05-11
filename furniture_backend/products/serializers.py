from rest_framework import serializers
from django.db.models import Avg
from django.utils.text import slugify
from .models import Category, Product, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "image", "parent"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "is_primary", "sort_order"]


class ProductListSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    primary_image = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "price", "discount_price", 
            "category", "primary_image", "is_available", "is_featured",
            "average_rating", "review_count"
        ]

    def get_average_rating(self, obj):
        return obj.reviews.aggregate(Avg("rating"))["rating__avg"] or 0

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).first()
        if not image:
            image = obj.images.first()
        if image:
            return image.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    category_details = CategorySerializer(source="category", read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()


    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "description", "price", "discount_price",
            "original_price", "rating", "features", "finishes",
            "category", "category_details", "sku", "stock", "material", "dimensions", "weight",
            "is_available", "is_featured", "created_at", "images",
            "average_rating", "review_count"
        ]



    def get_average_rating(self, obj):
        return obj.reviews.aggregate(Avg("rating"))["rating__avg"] or 0

    def get_review_count(self, obj):
        return obj.reviews.count()


class ProductSerializer(serializers.ModelSerializer):
    """
    General purpose serializer for Product model.
    """
    category = serializers.StringRelatedField()
    category_details = CategorySerializer(source="category", read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()


    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "description", "price", "discount_price",
            "original_price", "rating", "features", "finishes",
            "category", "category_details", "sku", "stock", "material", "dimensions", "weight",
            "is_available", "is_featured", "created_at", "images",
            "average_rating", "review_count"
        ]



    def get_average_rating(self, obj):
        return obj.reviews.aggregate(Avg("rating"))["rating__avg"] or 0

    def get_review_count(self, obj):
        return obj.reviews.count()

class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.CharField(), required=False, write_only=True
    )
    # Accept category name as string
    category = serializers.CharField(required=False) 
    sku = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "description", "price", "original_price",
            "category", "sku", "stock", "material", "dimensions", "weight",
            "is_available", "is_featured", "rating", "features", "finishes",
            "images"
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        category_name = validated_data.pop('category', None)
        
        # Handle Category
        if category_name:
            from .models import Category
            category, _ = Category.objects.get_or_create(name=category_name)
            validated_data['category'] = category
        elif not validated_data.get('category'):
            # If no category at all, we might need a default or error
            # For now, let's try to get a default category if any exist
            from .models import Category
            category = Category.objects.first()
            if category:
                validated_data['category'] = category

        # Handle original_price alias from frontend
        if 'originalPrice' in self.initial_data:
            validated_data['original_price'] = self.initial_data.get('originalPrice')

        if not validated_data.get("slug"):
            validated_data["slug"] = slugify(validated_data["name"])
        
        if not validated_data.get("sku"):
            import uuid
            validated_data["sku"] = f"FUR-{uuid.uuid4().hex[:8].upper()}"

        product = super().create(validated_data)

        # Create ProductImage objects
        for i, img_url in enumerate(images_data):
            try:
                from .models import ProductImage
                ProductImage.objects.create(
                    product=product,
                    image=img_url.split('/media/')[-1] if '/media/' in img_url else img_url,
                    is_primary=(i == 0),
                    sort_order=i
                )
            except Exception as e:
                print(f"Error saving image {img_url}: {e}")

        return product

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        category_name = validated_data.pop('category', None)

        if category_name:
            from .models import Category
            category, _ = Category.objects.get_or_create(name=category_name)
            validated_data['category'] = category
        
        if 'originalPrice' in self.initial_data:
            validated_data['original_price'] = self.initial_data.get('originalPrice')

        product = super().update(instance, validated_data)

        if images_data is not None:
            from .models import ProductImage
            # Refresh images
            instance.images.all().delete()
            for i, img_url in enumerate(images_data):
                ProductImage.objects.create(
                    product=instance,
                    image=img_url.split('/media/')[-1] if '/media/' in img_url else img_url,
                    is_primary=(i == 0),
                    sort_order=i
                )

        return product
