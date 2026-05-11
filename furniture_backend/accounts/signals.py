from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser
from .utils import send_welcome_email

@receiver(post_save, sender=CustomUser)
def handle_user_post_save(sender, instance, created, **kwargs):
    if created:
        # Action to perform when a new user is registered
        # Example: sending a welcome email
        send_welcome_email(instance.email, instance.first_name)
