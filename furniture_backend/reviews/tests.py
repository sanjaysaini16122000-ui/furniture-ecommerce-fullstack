from django.test import TestCase
from django.contrib.auth import get_user_model
from products.models import Product, Category
from reviews.models import Review
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class ReviewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="reviewer@example.com", password="password123", first_name="Test", last_name="User")
        self.client.force_authenticate(user=self.user)
        
        self.category = Category.objects.create(name="Furniture", slug="furniture")
        self.product = Product.objects.create(
            name="Wooden Chair",
            slug="wooden-chair",
            description="Nice chair",
            price=50.00,
            category=self.category,
            sku="CHAIR-001"
        )

    def test_create_review(self):
        response = self.client.post("/api/reviews/", {
            "product": self.product.id,
            "rating": 5,
            "comment": "Excellent quality!"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)
        self.assertEqual(Review.objects.first().rating, 5)

    def test_duplicate_review_prevented(self):
        # First review
        Review.objects.create(user=self.user, product=self.product, rating=4, comment="Good")
        
        # Second review by same user
        response = self.client.post("/api/reviews/", {
            "product": self.product.id,
            "rating": 5,
            "comment": "Actually it's better"
        })
        # My custom check in view returns 400
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_rating_validation(self):
        response = self.client.post("/api/reviews/", {
            "product": self.product.id,
            "rating": 6,  # Invalid rating
            "comment": "Too good to be true"
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_product_detail_stats(self):
        # Create reviews
        user2 = User.objects.create_user(email="other@example.com", password="password123")
        Review.objects.create(user=self.user, product=self.product, rating=5, comment="Great")
        Review.objects.create(user=user2, product=self.product, rating=3, comment="Okay")

        response = self.client.get(f"/api/products/{self.product.id}/")
        
        # We need to know the path of products API. It's usually /api/products/<id>/
        # Let's check products urls
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["review_count"], 2)
        # (5+3)/2 = 4.0
        self.assertEqual(response.data["average_rating"], 4.0)
