from django.test import TestCase, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core import mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from rest_framework.test import APIClient
from rest_framework import status
from notifications.tasks import send_verification_email_task, send_password_reset_email_task

User = get_user_model()

@override_settings(CELERY_TASK_ALWAYS_EAGER=True, CELERY_TASK_EAGER_PROPAGATES=True)
class AuthFeaturesTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.password_reset_url = reverse("password-reset-request")
        self.password_reset_confirm_url = reverse("password-reset-confirm")
        
        self.user_data = {
            "email": "test@example.com",
            "password": "Password123!",
            "first_name": "Test",
            "last_name": "User"
        }

    def test_registration_triggers_verification_email(self):
        mail.outbox = []
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        user = User.objects.get(email=self.user_data["email"])
        self.assertFalse(user.is_verified)
        
        # Two emails should be sent: 1. Welcome email (via signal), 2. Verification email (via task)
        self.assertEqual(len(mail.outbox), 2)
        
        # Check if one of the emails is the verification email
        subjects = [m.subject for m in mail.outbox]
        self.assertIn("Verify your email - Furniture Store", subjects)
        self.assertIn("Welcome to Our Furniture Store!", subjects)

    def test_verify_email_endpoint(self):
        user = User.objects.create_user(**self.user_data)
        from rest_framework_simplejwt.tokens import AccessToken
        token = str(AccessToken.for_user(user))
        
        verify_url = reverse("verify-email", kwargs={"token": token})
        response = self.client.get(verify_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.is_verified)

    def test_password_reset_flow(self):
        user = User.objects.create_user(**self.user_data)
        mail.outbox = []
        
        # 1. Request reset
        response = self.client.post(self.password_reset_url, {"email": user.email})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 2. Check if email was sent automatically
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "Password Reset Request - Furniture Store")
        
        # Extract uidb64 and token from the email body to simulate the click
        # reset_url = f"http://localhost:8000/api/auth/password-reset-confirm/?uidb64={uidb64}&token={token}"
        import re
        body = mail.outbox[0].body
        match = re.search(r"uidb64=([^&]+)&token=([^\s]+)", body)
        self.assertTrue(match)
        uidb64 = match.group(1)
        token = match.group(2)
        
        # 3. Confirm reset
        new_password = "NewPassword123!"
        response = self.client.post(self.password_reset_confirm_url, {
            "uidb64": uidb64,
            "token": token,
            "password": new_password
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 4. Verify login with new password
        login_response = self.client.post(self.login_url, {
            "email": user.email,
            "password": new_password
        })
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
