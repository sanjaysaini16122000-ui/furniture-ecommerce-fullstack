"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/wishlist/', include('wishlist.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/coupons/', include('coupons.urls')),
    path('api/shipping/', include('shipping.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/analytics/', include('analytics.urls')),
    
    # Admin API routes
    path('api/admin/users/', include('accounts.admin_urls')),
    path('api/admin/dashboard/', include('analytics.admin_urls')),
    path('api/upload/image/', include('common.upload_urls')),
    path('api/contact/', include('contact.urls')),
    path('api/visualizer/', include('visualizer.urls')),
    
    # Root URL
    path('', lambda request: JsonResponse({
        "message": "Welcome to Furniture Ecommerce API",
        "status": "Running",
        "admin_panel": "/admin/",
        "documentation": "https://github.com/sanjaysaini16122000-ui/furniture-ecommerce-fullstack"
    })),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
        re_path(r'^static/(?P<path>.*)$', serve, {
            'document_root': settings.STATIC_ROOT,
        }),
    ]








