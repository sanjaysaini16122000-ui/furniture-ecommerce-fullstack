from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import ContactMessage
from .serializers import ContactMessageSerializer

class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling contact form messages.
    - POST: Allow public submissions of contact form.
    - GET/PATCH/DELETE: restricted to admin users for managing messages.
    """
    queryset = ContactMessage.objects.all().order_by("-created_at")
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {"message": "Your message has been sent successfully. We will get back to you soon!"},
            status=status.HTTP_201_CREATED
        )
