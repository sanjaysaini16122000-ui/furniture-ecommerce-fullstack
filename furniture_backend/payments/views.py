import uuid
import stripe
from rest_framework import status, views, permissions
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from orders.models import Order
from .models import Payment
from .serializers import PaymentInitializeSerializer, PaymentVerifySerializer, PaymentSerializer
from notifications.emails import build_payment_success_email

class PaymentInitializeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        print(f"[DEBUG] PaymentInitializeView.post called by {request.user}")
        serializer = PaymentInitializeSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        
        order_id = serializer.validated_data["order_id"]
        payment_method = serializer.validated_data.get("payment_method", "simulated")
        
        from django.http import Http404
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            print(f"[DEBUG] Order {order_id} not found for user {request.user}")
            return Response({"error": f"Order {order_id} not found"}, status=status.HTTP_404_NOT_FOUND)

        if order.status != "pending" and order.status != "unpaid":
            # Some frontends might use 'unpaid' for payment-ready orders
            pass 

        if payment_method in ["stripe", "online"]:
            try:
                stripe.api_key = settings.STRIPE_SECRET_KEY
                
                # Check for Stripe's minimum amount (typically ~$0.50)
                # ₹10 is too low for Stripe (approx $0.11)
                total_in_paisa = int(order.total * 100)
                if total_in_paisa < 4000: # Approx ₹40 (~$0.50)
                    return Response({
                        "error": "The order total is too low for an online payment. Minimum allowed is ₹40. Please add more items to your cart."
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Prepare line items for Stripe Checkout

                line_items = []
                for item in order.items.all():
                    # Get the primary image or first available image
                    product_img = item.product.images.filter(is_primary=True).first() or item.product.images.first()
                    img_url = request.build_absolute_uri(product_img.image.url) if product_img and product_img.image else None
                    
                    line_items.append({
                        'price_data': {
                            'currency': 'inr',
                            'product_data': {
                                'name': item.product.name,
                                'images': [img_url] if img_url else [],
                            },
                            'unit_amount': int(item.unit_price * 100),
                        },
                        'quantity': item.quantity,
                    })


                # Create Stripe Checkout Session
                session = stripe.checkout.Session.create(
                    payment_method_types=['card'],
                    line_items=line_items,
                    mode='payment',
                    success_url=settings.PAYMENT_SUCCESS_URL + "?session_id={CHECKOUT_SESSION_ID}",
                    cancel_url=settings.PAYMENT_CANCEL_URL,
                    customer_email=request.user.email,
                    metadata={
                        'order_id': order.id,
                        'user_id': request.user.id
                    }
                )

                # Create a pending payment record
                Payment.objects.create(
                    user=request.user,
                    order=order,
                    payment_method="stripe",
                    amount=order.total,
                    status="pending",
                    provider_order_id=session.id
                )

                return Response({
                    "checkout_url": session.url,
                    "session_id": session.id,
                    "message": "Stripe checkout session created"
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Stripe Error: {str(e)}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Fallback to simulated/COD
        provider_order_id = f"SIM-{uuid.uuid4().hex[:12].upper()}"
        payment = Payment.objects.create(
            user=request.user,
            order=order,
            payment_method=payment_method,
            amount=order.total,
            status="pending",
            provider_order_id=provider_order_id
        )

        return Response({
            "payment_id": payment.id,
            "provider_order_id": provider_order_id,
            "amount": order.total,
            "currency": "INR",
            "message": "Payment initialized successfully",
            "checkout_url": f"{settings.PAYMENT_SUCCESS_URL}?simulated=true&order_id={order.id}" # For simulated
        }, status=status.HTTP_201_CREATED)

class PaymentVerifyView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = PaymentVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        session_id = serializer.validated_data.get("session_id")
        
        if session_id:
            # Handle Stripe checkout verification
            try:
                stripe.api_key = settings.STRIPE_SECRET_KEY
                session = stripe.checkout.Session.retrieve(session_id)
                
                if session.payment_status == 'paid':
                    order_id = session.metadata.get('order_id')
                    order = get_object_or_404(Order, id=order_id, user=request.user)
                    payment = get_object_or_404(Payment, order=order, provider_order_id=session_id)
                    
                    if payment.status != "completed":
                        payment.status = "completed"
                        payment.transaction_id = session.payment_intent
                        payment.save()

                    if order.payment_status != "paid":
                        order.payment_status = "paid"
                        order.status = "confirmed"
                        order.save()

                    return Response({
                        "message": "Payment verified via Stripe",
                        "order_status": order.status,
                        "payment_status": "paid"
                    })
                return Response({"error": "Payment not completed"}, status=400)
            except Exception as e:
                return Response({"error": str(e)}, status=400)

        order_id = serializer.validated_data.get("order_id")
        transaction_id = serializer.validated_data.get("transaction_id")
        
        if not order_id:
            return Response({"error": "order_id is required for simulated payments"}, status=400)

        # Get the pending payment for this order
        payment = get_object_or_404(Payment, order_id=order_id, user=request.user, status="pending")
        order = payment.order

        if payment.payment_method == "cod":
            # For COD, we mark payment as pending but order as confirmed
            payment.transaction_id = f"COD-{uuid.uuid4().hex[:12].upper()}"
            payment.save()
            
            order.status = "confirmed"
            order.save()

            # Send payment success email directly (no Celery needed)
            try:
                subject, message, recipient_list = build_payment_success_email(payment)
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=recipient_list,
                    fail_silently=False,
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send payment email: {str(e)}")
            
            return Response({
                "message": "COD order confirmed", 
                "order_status": order.status,
                "payment_status": payment.status
            }, status=status.HTTP_200_OK)

        # For simulated payment, we assume success if transaction_id is provided
        payment.status = "completed"
        payment.transaction_id = transaction_id
        payment.save()

        order.status = "confirmed"
        order.payment_status = "paid"
        order.save()

        # Send payment success email directly (no Celery needed)
        try:
            subject, message, recipient_list = build_payment_success_email(payment)
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipient_list,
                fail_silently=False,
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send payment email: {str(e)}")

        return Response({
            "message": "Payment verified and order confirmed",
            "order_status": order.status,
            "payment_status": "paid",
            "transaction_id": transaction_id
        }, status=status.HTTP_200_OK)

class StripeWebhookView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @method_decorator(csrf_exempt)
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        event = None

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError as e:
            return HttpResponse(status=400)

        # Handle the checkout.session.completed event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            
            # Internal order_id stored in metadata
            order_id = session.get('metadata', {}).get('order_id')
            if order_id:
                try:
                    order = Order.objects.get(id=order_id)
                    payment = Payment.objects.get(order=order, provider_order_id=session.id)
                    
                    payment.status = "completed"
                    payment.transaction_id = session.payment_intent
                    payment.save()

                    order.status = "confirmed"
                    order.payment_status = "paid"
                    order.save()

                    # Send confirmation email
                    try:
                        subject, message, recipient_list = build_payment_success_email(payment)
                        send_mail(
                            subject=subject,
                            message=message,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=recipient_list,
                            fail_silently=True,
                        )
                    except:
                        pass
                except (Order.DoesNotExist, Payment.DoesNotExist):
                    pass

        return HttpResponse(status=200)
