from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from orders.models import Order
from payments.models import Payment
from accounts.models import CustomUser
from .emails import (
    build_order_confirmation_email, build_payment_success_email,
    build_verification_email, build_password_reset_email
)
from .models import Notification
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_twilio_sms_task(phone_number, message):
    """
    Sends an SMS via Twilio.
    """
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        logger.warning(f"Twilio settings missing. Simulated SMS to {phone_number}: {message}")
        return

    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        logger.info(f"SMS sent successfully to {phone_number}")
    except Exception as e:
        logger.error(f"Failed to send SMS to {phone_number}: {str(e)}")

@shared_task
def create_notification_task(user_id, type, title, message):
    """
    Creates a database notification record.
    """
    try:
        user = CustomUser.objects.get(id=user_id)
        Notification.objects.create(
            user=user,
            type=type,
            title=title,
            message=message
        )
        logger.info(f"Notification created for user {user.email}")
    except Exception as e:
        logger.error(f"Failed to create notification: {str(e)}")

@shared_task
def send_order_confirmation_email_task(order_id):
    try:
        order = Order.objects.get(id=order_id)
        subject, message, recipient_list = build_order_confirmation_email(order)
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        return f"Order confirmation email sent for {order.order_number}"
    except Order.DoesNotExist:
        return f"Order {order_id} not found"

@shared_task
def send_payment_success_email_task(payment_id):
    try:
        payment = Payment.objects.get(id=payment_id)
        subject, message, recipient_list = build_payment_success_email(payment)
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        return f"Payment success email sent for {payment.order.order_number}"
    except Payment.DoesNotExist:
        return f"Payment {payment_id} not found"

@shared_task
def send_verification_email_task(user_id, token):
    try:
        user = CustomUser.objects.get(id=user_id)
        subject, message, recipient_list = build_verification_email(user, token)
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        return f"Verification email sent for {user.email}"
    except CustomUser.DoesNotExist:
        return f"User {user_id} not found"

@shared_task
def send_password_reset_email_task(user_id, uidb64, token):
    try:
        user = CustomUser.objects.get(id=user_id)
        subject, message, recipient_list = build_password_reset_email(user, uidb64, token)
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        return f"Password reset email sent for {user.email}"
    except CustomUser.DoesNotExist:
        return f"User {user_id} not found"
