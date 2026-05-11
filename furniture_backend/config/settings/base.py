from pathlib import Path
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = True

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "unfold",
    "unfold.contrib.filters",
    "unfold.contrib.forms",
    "unfold.contrib.import_export",
    "unfold.contrib.guardian",
    "unfold.contrib.simple_history",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third Party
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",


    # Local apps
    "accounts",
    "products",
    "cart",
    "wishlist",
    "orders",
    "coupons",
    "shipping",
    "payments",
    "reviews",
    "notifications",
    "analytics",
    "common",
    "contact",
    "visualizer",
]








MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "common.middleware.RequestLoggingMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Media files configuration
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# REST Framework Settings
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "common.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 10,
    "EXCEPTION_HANDLER": "common.exceptions.custom_exception_handler",
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": None,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
}

CORS_ALLOW_ALL_ORIGINS = True

AUTH_USER_MODEL = "accounts.CustomUser"
# Celery Settings
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = None
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE
# Quick fix: Execute Celery tasks synchronously (no Redis required)
CELERY_ALWAYS_EAGER = True
CELERY_EAGER_PROPAGATES_EXCEPTIONS = True

# Email Settings
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = "Furniture Store <notifications@furniture.com>"

UNFOLD = {
    "SITE_TITLE": "Furniture Store Admin",
    "SITE_HEADER": "Furniture Store",
    "SITE_SYMBOL": "shopping_cart",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "COLORS": {
        "primary": {
            "50": "250 245 255",
            "100": "243 232 255",
            "200": "233 213 255",
            "300": "216 180 254",
            "400": "192 132 252",
            "500": "139 92 246",  # Deeper purple
            "600": "124 58 237",
            "700": "109 40 217",
            "800": "91 33 182",
            "900": "76 29 149",
            "950": "46 16 101",
        },
    },
    "STYLES": [
        lambda request: """
            /* Light Mode Contrast Fixes */
            :root:not(.dark) {
                --color-primary-600: #7c3aed;
                --color-primary-700: #6d28d9;
            }
            
            /* Darken sidebar text in light mode */
            :root:not(.dark) aside a {
                color: #374151 !important; /* Gray 700 */
                font-weight: 500;
            }
            :root:not(.dark) aside a:hover {
                color: #111827 !important; /* Gray 900 */
                background-color: #f3f4f6 !important;
            }
            :root:not(.dark) aside .group-title {
                color: #1f2937 !important; /* Gray 800 */
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            /* Improve form field visibility in light mode */
            :root:not(.dark) input, :root:not(.dark) select, :root:not(.dark) textarea {
                border-color: #d1d5db !important; /* Gray 300 */
            }
            :root:not(.dark) input:focus {
                border-color: #7c3aed !important;
                ring-color: #7c3aed !important;
            }
        """
    ],
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "Shop",
                "separator": True,
                "items": [
                    {
                        "title": "Products",
                        "icon": "inventory_2",
                        "link": "/admin/products/product/",
                    },
                    {
                        "title": "Categories",
                        "icon": "category",
                        "link": "/admin/products/category/",
                    },
                    {
                        "title": "Orders",
                        "icon": "shopping_basket",
                        "link": "/admin/orders/order/",
                    },
                    {
                        "title": "Payments",
                        "icon": "payments",
                        "link": "/admin/payments/payment/",
                    },
                ],
            },
            {
                "title": "Customers",
                "separator": True,
                "items": [
                    {
                        "title": "Users",
                        "icon": "people",
                        "link": "/admin/accounts/customuser/",
                    },
                    {
                        "title": "Cart Items",
                        "icon": "shopping_cart",
                        "link": "/admin/cart/cart/",
                    },
                    {
                        "title": "Wishlist",
                        "icon": "favorite",
                        "link": "/admin/wishlist/wishlistitem/",
                    },
                ],
            },
            {
                "title": "Promotions",
                "separator": True,
                "items": [
                    {
                        "title": "Coupons",
                        "icon": "local_offer",
                        "link": "/admin/coupons/coupon/",
                    },
                ],
            },
        ],
    },
}

# Twilio Settings
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Stripe Settings
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

# Frontend URLs for Payment Redirects
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
PAYMENT_SUCCESS_URL = f"{FRONTEND_URL}/payment/success"
PAYMENT_CANCEL_URL = f"{FRONTEND_URL}/payment/cancel"


# Background Removal API (Remove.bg)
REMOVE_BG_API_KEY = os.getenv("REMOVE_BG_API_KEY", "")



