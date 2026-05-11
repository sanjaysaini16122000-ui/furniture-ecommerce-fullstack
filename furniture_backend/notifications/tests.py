from django.test import TestCase
from django.core import mail
from orders.models import Order
from payments.models import Payment
from django.contrib.auth import get_user_model
from notifications.tasks import send_order_confirmation_email_task, send_payment_success_email_task

User = get_user_model()

class NotificationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="notified@example.com", password="password123", first_name="John")
        self.order = Order.objects.create(
            user=self.user,
            total=500.00,
            subtotal=500.00,
            status="pending"
        )
        self.payment = Payment.objects.create(
            user=self.user,
            order=self.order,
            payment_method="simulated",
            amount=500.00,
            status="completed",
            transaction_id="TXN-EMAIL-TEST"
        )

    def test_order_confirmation_email_logic(self):
        mail.outbox = [] # Clear any emails from setUp if any (there shouldn't be)
        # Call the task directly (synchronously) for testing
        result = send_order_confirmation_email_task(self.order.id)
        
        self.assertIn("Order confirmation email sent", result)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, f"Order Confirmation - {self.order.order_number}")
        self.assertIn("John", mail.outbox[0].body)
        self.assertIn(str(self.order.total), mail.outbox[0].body)

    def test_payment_success_email_logic(self):
        # Reset outbox from previous test if needed, though TestCase does this
        mail.outbox = []
        
        result = send_payment_success_email_task(self.payment.id)
        
        self.assertIn("Payment success email sent", result)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, f"Payment Successful - Order {self.order.order_number}")
        self.assertIn("TXN-EMAIL-TEST", mail.outbox[0].body)
