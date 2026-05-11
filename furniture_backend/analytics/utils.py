from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from orders.models import Order
from accounts.models import CustomUser
from products.models import Product
from reviews.models import Review

def get_dashboard_kpis():
    """
    Returns high-level KPIs for the shop, matching frontend keys.
    """
    total_revenue = Order.objects.filter(status="confirmed").aggregate(Sum("total"))["total__sum"] or 0
    total_orders = Order.objects.count()
    active_orders = Order.objects.exclude(status__in=["delivered", "cancelled", "failed"]).count()
    total_users = CustomUser.objects.count()
    total_products = Product.objects.count()
    
    return {
        "total_revenue": float(total_revenue),
        "total_orders": total_orders,
        "active_orders": active_orders,
        "total_users": total_users,
        "total_products": total_products,
    }

def get_sales_trend(days=30):
    """
    Returns daily revenue for the last X days.
    """
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)
    
    # This is a simplified trend aggregation for SQLite
    # In production with PostgreSQL, we'd use TruncDay
    orders = Order.objects.filter(
        status="confirmed",
        created_at__range=[start_date, end_date]
    ).values("created_at__date").annotate(revenue=Sum("total")).order_by("created_at__date")
    
    trend = []
    current_date = start_date.date()
    while current_date <= end_date.date():
        revenue = next((o["revenue"] for o in orders if o["created_at__date"] == current_date), 0)
        trend.append({
            "date": current_date.isoformat(),
            "revenue": float(revenue)
        })
        current_date += timedelta(days=1)
        
    return trend

def get_recent_activity(limit=10):
    """
    Returns a unified feed of recent events.
    """
    activities = []
    
    # Recent Orders
    recent_orders = Order.objects.select_related("user").order_by("-created_at")[:limit]
    for order in recent_orders:
        activities.append({
            "type": "order",
            "title": f"New Order #{order.order_number}",
            "description": f"Placed by {order.user.email} (Total: {order.total})",
            "timestamp": order.created_at,
            "status": order.status
        })
        
    # Recent Reviews
    recent_reviews = Review.objects.select_related("user", "product").order_by("-created_at")[:limit]
    for review in recent_reviews:
        activities.append({
            "type": "review",
            "title": f"New Review on {review.product.name}",
            "description": f"{review.user.email} gave {review.rating} stars",
            "timestamp": review.created_at,
            "status": "approved" if getattr(review, 'is_approved', True) else "pending"
        })

    # Sort all by timestamp
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities[:limit]
