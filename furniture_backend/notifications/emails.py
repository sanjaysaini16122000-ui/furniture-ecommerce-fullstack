from django.core.mail import send_mail
from django.conf import settings

def build_order_confirmation_email(order):
    subject = f"Order Confirmation - {order.order_number}"
    message = f"""
    Hi {order.user.first_name if order.user.first_name else 'Valued Customer'},

    Thank you for your order!

    Order Number: {order.order_number}
    Total Amount: ₹{order.total}
    
    We are currently processing your order and will notify you once it has been shipped.

    Best regards,
    Furniture Store Team
    """
    return subject, message, [order.user.email]

def build_payment_success_email(payment):
    subject = f"Payment Successful - Order {payment.order.order_number}"
    message = f"""
    Hi {payment.user.first_name if payment.user.first_name else 'Valued Customer'},

    We have received your payment for order {payment.order.order_number}.

    Transaction ID: {payment.transaction_id}
    Amount Paid: ₹{payment.amount}
    
    Thank you for shopping with us!

    Best regards,
    Furniture Store Team
    """
    return subject, message, [payment.user.email]

def build_verification_email(user, token):
    subject = "Verify your email - Furniture Store"
    verification_url = f"http://localhost:8000/api/auth/verify/{token}/"
    message = f"""
    Hi {user.first_name if user.first_name else 'Valued Customer'},

    Please click the link below to verify your email address:
    {verification_url}

    If you did not create an account, please ignore this email.

    Best regards,
    Furniture Store Team
    """
    return subject, message, [user.email]

def build_password_reset_email(user, uidb64, token):
    subject = "Password Reset Request - Furniture Store"
    reset_url = f"http://localhost:8000/api/auth/password-reset-confirm/?uidb64={uidb64}&token={token}"
    message = f"""
    Hi {user.first_name if user.first_name else 'Valued Customer'},

    You requested a password reset for your account. Please click the link below to set a new password:
    {reset_url}

    If you did not request this, please ignore this email.

    Best regards,
    Furniture Store Team
    """
    return subject, message, [user.email]
