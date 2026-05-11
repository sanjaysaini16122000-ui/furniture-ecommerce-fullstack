from django.urls import path
from .views import PaymentInitializeView, PaymentVerifyView, StripeWebhookView

urlpatterns = [
    path("initialize/", PaymentInitializeView.as_view(), name="payment-initialize"),
    path("create-intent/", PaymentInitializeView.as_view(), name="payment-create-intent"),
    path("verify/", PaymentVerifyView.as_view(), name="payment-verify"),
    path("verify-intent/", PaymentVerifyView.as_view(), name="payment-verify-intent"),
    path("webhook/stripe/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
