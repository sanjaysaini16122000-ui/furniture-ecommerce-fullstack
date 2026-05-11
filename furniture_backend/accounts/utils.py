from django.core.mail import send_mail
from django.conf import settings

def send_welcome_email(email, name):
    subject = "Welcome to Our Furniture Store!"
    message = f"Hi {name},\n\nThank you for registering with us. We are happy to have you on board!"
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [email]
    
    # Using fail_silently=True so it doesn't crash if email settings are not configured
    try:
        send_mail(subject, message, email_from, recipient_list, fail_silently=True)
    except Exception as e:
        print(f"Error sending email: {e}")

def send_verification_email(email, token):
    subject = "Verify Your Email"
    message = f"Please click the link below to verify your email:\n\nhttp://localhost:8000/api/accounts/verify/{token}/"
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [email]
    
    try:
        send_mail(subject, message, email_from, recipient_list, fail_silently=True)
    except Exception as e:
        print(f"Error sending email: {e}")
