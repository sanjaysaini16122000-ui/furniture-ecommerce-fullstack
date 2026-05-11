from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Category, Product

class ProductSearchTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("product-list")
        
        # Create Categories
        self.furniture = Category.objects.create(name="Furniture", slug="furniture")
        self.tables = Category.objects.create(name="Tables", slug="tables", parent=self.furniture)
        self.chairs = Category.objects.create(name="Chairs", slug="chairs", parent=self.furniture)
        
        # Create Products
        self.oak_table = Product.objects.create(
            name="Oak Dining Table",
            slug="oak-dining-table",
            description="Beautiful oak dining table",
            price=5000.00,
            category=self.tables,
            sku="TAB-OAK-01",
            material="Oak"
        )
        self.glass_table = Product.objects.create(
            name="Glass Coffee Table",
            slug="glass-coffee-table",
            description="Modern glass coffee table",
            price=2500.00,
            category=self.tables,
            sku="TAB-GLS-01",
            material="Glass"
        )
        self.office_chair = Product.objects.create(
            name="Ergonomic Office Chair",
            slug="ergonomic-office-chair",
            description="Comfortable office chair",
            price=1500.00,
            category=self.chairs,
            sku="CHR-ERG-01",
            material="Plastic/Mesh"
        )

    def test_filter_by_min_price(self):
        response = self.client.get(self.url, {"min_price": 2000})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return Oak Table (5000) and Glass Table (2500)
        self.assertEqual(len(response.data), 2)

    def test_filter_by_max_price(self):
        response = self.client.get(self.url, {"max_price": 2000})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return Office Chair (1500)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Ergonomic Office Chair")

    def test_hierarchical_category_filtering(self):
        # Filter by Parent Category 'Furniture'
        response = self.client.get(self.url, {"category": "furniture"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return all 3 products (Tables and Chairs are subcategories of Furniture)
        self.assertEqual(len(response.data), 3)

    def test_direct_category_filtering(self):
        # Filter by Subcategory 'Tables'
        response = self.client.get(self.url, {"category": "tables"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return 2 products (Oak and Glass tables)
        self.assertEqual(len(response.data), 2)

    def test_search_by_name(self):
        response = self.client.get(self.url, {"search": "Dining"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Oak Dining Table")

    def test_search_by_material(self):
        response = self.client.get(self.url, {"search": "Glass"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Glass Coffee Table")
