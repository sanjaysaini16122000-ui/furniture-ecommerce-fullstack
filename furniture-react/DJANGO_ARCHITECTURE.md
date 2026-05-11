# Django E-commerce Backend — Furniture Website

Complete architecture for a production-ready furniture e-commerce platform with Django backend.

---

## 1. System Overview

```mermaid
graph TB
    subgraph "Frontend — React + Vite"
        A["🖥️ React App"]
        A1["Public Pages<br/>(Home, Furniture, Kitchen,<br/>Projects, Contact, About)"]
        A2["Auth Pages<br/>(Login, Register, Profile)"]
        A3["Shop Pages<br/>(Cart, Wishlist, Checkout)"]
        A4["User Pages<br/>(Orders, Reviews, Addresses)"]
        A5["Admin Panel"]
    end

    subgraph "API Layer"
        B["🔌 Django REST Framework"]
        B1["JWT Auth<br/>(Access + Refresh Tokens)"]
        B2["Throttling &<br/>Rate Limiting"]
    end

    subgraph "Backend — Django Apps"
        C1["👤 accounts"]
        C2["🪑 products"]
        C3["🛒 cart"]
        C4["📦 orders"]
        C5["💳 payments"]
        C6["❤️ wishlist"]
        C7["⭐ reviews"]
        C8["🏷️ coupons"]
        C9["🚚 shipping"]
        C10["📧 notifications"]
        C11["📊 analytics"]
    end

    subgraph "External Services"
        E1["💳 Razorpay / Stripe"]
        E2["📧 Email (SMTP)"]
        E3["📱 SMS (Twilio)"]
        E4["☁️ Cloudinary / S3"]
    end

    subgraph "Database & Cache"
        D1[("🐘 PostgreSQL")]
        D2[("⚡ Redis Cache")]
    end

    A --> B
    B --> B1
    B --> B2
    B1 --> C1
    B --> C2
    B --> C3
    B --> C4
    B --> C5
    B --> C6
    B --> C7
    B --> C8
    B --> C9
    C5 --> E1
    C10 --> E2
    C10 --> E3
    C2 --> E4
    C1 --> D1
    C2 --> D1
    C3 --> D1
    C4 --> D1
    C5 --> D1
    C3 --> D2
    C11 --> D2
```

---

## 2. Database ER Diagram

```mermaid
erDiagram
    USER {
        int id PK
        string email UK
        string password
        string first_name
        string last_name
        string phone
        string avatar_url
        boolean is_active
        boolean is_verified
        datetime created_at
    }

    ADDRESS {
        int id PK
        int user_id FK
        string label
        string street
        string city
        string state
        string pincode
        string country
        boolean is_default
    }

    CATEGORY {
        int id PK
        string name
        string slug UK
        string image_url
        int parent_id FK
    }

    PRODUCT {
        int id PK
        string name
        string slug UK
        text description
        decimal price
        decimal discount_price
        int category_id FK
        string sku UK
        int stock
        string material
        string dimensions
        decimal weight
        boolean is_available
        boolean is_featured
        datetime created_at
    }

    PRODUCT_IMAGE {
        int id PK
        int product_id FK
        string image_url
        boolean is_primary
        int sort_order
    }

    CART {
        int id PK
        int user_id FK
        datetime created_at
        datetime updated_at
    }

    CART_ITEM {
        int id PK
        int cart_id FK
        int product_id FK
        int quantity
        datetime added_at
    }

    WISHLIST_ITEM {
        int id PK
        int user_id FK
        int product_id FK
        datetime added_at
    }

    ORDER {
        int id PK
        string order_number UK
        int user_id FK
        int shipping_address_id FK
        decimal subtotal
        decimal shipping_cost
        decimal discount
        decimal tax
        decimal total
        string status
        string tracking_number
        datetime created_at
    }

    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }

    PAYMENT {
        int id PK
        int order_id FK
        string gateway
        string transaction_id UK
        decimal amount
        string currency
        string status
        string method
        json gateway_response
        datetime paid_at
    }

    COUPON {
        int id PK
        string code UK
        string type
        decimal value
        decimal min_order
        int max_uses
        int used_count
        datetime valid_from
        datetime valid_until
        boolean is_active
    }

    REVIEW {
        int id PK
        int user_id FK
        int product_id FK
        int rating
        text comment
        boolean is_approved
        datetime created_at
    }

    SHIPPING_METHOD {
        int id PK
        string name
        decimal price
        string estimated_days
        boolean is_active
    }

    NOTIFICATION {
        int id PK
        int user_id FK
        string type
        string title
        text message
        boolean is_read
        datetime created_at
    }

    USER ||--o{ ADDRESS : "has"
    USER ||--o| CART : "has one"
    USER ||--o{ WISHLIST_ITEM : "saves"
    USER ||--o{ ORDER : "places"
    USER ||--o{ REVIEW : "writes"
    USER ||--o{ NOTIFICATION : "receives"
    CATEGORY ||--o{ CATEGORY : "has subcategories"
    CATEGORY ||--o{ PRODUCT : "contains"
    PRODUCT ||--o{ PRODUCT_IMAGE : "has"
    PRODUCT ||--o{ REVIEW : "receives"
    CART ||--o{ CART_ITEM : "contains"
    CART_ITEM }o--|| PRODUCT : "references"
    WISHLIST_ITEM }o--|| PRODUCT : "references"
    ORDER ||--o{ ORDER_ITEM : "contains"
    ORDER ||--|| PAYMENT : "has"
    ORDER }o--|| ADDRESS : "ships to"
    ORDER_ITEM }o--|| PRODUCT : "references"
```

---

## 3. All API Endpoints

```mermaid
graph LR
    subgraph "🔐 Auth — /api/auth/"
        AU1["POST /register/"]
        AU2["POST /login/"]
        AU3["POST /logout/"]
        AU4["POST /token/refresh/"]
        AU5["POST /forgot-password/"]
        AU6["POST /reset-password/"]
        AU7["POST /verify-email/"]
        AU8["GET  /profile/"]
        AU9["PUT  /profile/update/"]
        AU10["POST /change-password/"]
    end

    subgraph "📍 Address — /api/addresses/"
        AD1["GET    /"]
        AD2["POST   /"]
        AD3["PUT    /:id/"]
        AD4["DELETE /:id/"]
        AD5["POST   /:id/set-default/"]
    end

    subgraph "🪑 Products — /api/products/"
        P1["GET /"]
        P2["GET /:slug/"]
        P3["GET /categories/"]
        P4["GET /featured/"]
        P5["GET /search/?q=&category=&min_price=&max_price=&sort="]
    end
```

```mermaid
graph LR
    subgraph "🛒 Cart — /api/cart/"
        C1["GET    /"]
        C2["POST   /add/"]
        C3["PUT    /update/:item_id/"]
        C4["DELETE /remove/:item_id/"]
        C5["DELETE /clear/"]
        C6["GET    /count/"]
    end

    subgraph "❤️ Wishlist — /api/wishlist/"
        W1["GET    /"]
        W2["POST   /add/"]
        W3["DELETE /remove/:id/"]
        W4["POST   /move-to-cart/:id/"]
    end

    subgraph "🏷️ Coupons — /api/coupons/"
        CO1["POST /apply/"]
        CO2["POST /remove/"]
        CO3["POST /validate/"]
    end
```

```mermaid
graph LR
    subgraph "📦 Orders — /api/orders/"
        O1["POST /checkout/"]
        O2["GET  /history/"]
        O3["GET  /:id/"]
        O4["POST /:id/cancel/"]
        O5["GET  /:id/invoice/"]
        O6["GET  /:id/track/"]
    end

    subgraph "💳 Payments — /api/payments/"
        PM1["POST /create-order/"]
        PM2["POST /verify/"]
        PM3["GET  /methods/"]
        PM4["POST /refund/:order_id/"]
    end

    subgraph "⭐ Reviews — /api/reviews/"
        R1["GET  /product/:slug/"]
        R2["POST /product/:slug/"]
        R3["PUT  /:id/"]
        R4["DELETE /:id/"]
    end

    subgraph "📧 Notifications — /api/notifications/"
        N1["GET  /"]
        N2["POST /:id/read/"]
        N3["POST /read-all/"]
    end
```

---

## 4. Authentication Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant R as ⚛️ React
    participant D as 🐍 Django
    participant DB as 🐘 PostgreSQL
    participant E as 📧 Email

    Note over U,E: Registration
    U->>R: Fill register form
    R->>D: POST /api/auth/register/
    D->>DB: Create User (is_verified=false)
    D->>E: Send verification email
    D-->>R: 201 Created
    R-->>U: "Check your email"

    U->>R: Click verification link
    R->>D: POST /api/auth/verify-email/
    D->>DB: Set is_verified=true
    D-->>R: 200 + JWT tokens
    R-->>U: Redirect to Home

    Note over U,E: Login
    U->>R: Enter email & password
    R->>D: POST /api/auth/login/
    D->>DB: Validate credentials
    D-->>R: 200 + Access & Refresh tokens
    R->>R: Store tokens
    R-->>U: Logged-in UI

    Note over U,E: Forgot Password
    U->>R: Enter email
    R->>D: POST /api/auth/forgot-password/
    D->>E: Send reset link
    U->>R: Click link, enter new password
    R->>D: POST /api/auth/reset-password/
    D->>DB: Update password
    D-->>R: 200 OK
```

---

## 5. Payment & Checkout Flow (Razorpay)

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant R as ⚛️ React
    participant D as 🐍 Django
    participant DB as 🐘 PostgreSQL
    participant RZ as 💳 Razorpay

    U->>R: Click "Proceed to Checkout"
    R->>D: GET /api/cart/
    D-->>R: Cart items + totals

    U->>R: Select address, shipping, apply coupon
    R->>D: POST /api/coupons/apply/
    D-->>R: Discounted total

    U->>R: Click "Pay Now"
    R->>D: POST /api/payments/create-order/<br/>{"address_id, shipping_method_id, coupon_code"}
    D->>DB: Create Order (status=pending)
    D->>RZ: Create Razorpay Order
    RZ-->>D: razorpay_order_id
    D-->>R: {order_id, razorpay_order_id, amount, key}

    R->>RZ: Open Razorpay Checkout Modal
    U->>RZ: Complete payment (UPI/Card/NetBanking)
    RZ-->>R: {payment_id, signature}

    R->>D: POST /api/payments/verify/<br/>{payment_id, order_id, signature}
    D->>D: Verify signature (HMAC SHA256)

    alt Signature Valid
        D->>DB: Update Order status=confirmed
        D->>DB: Create Payment record
        D->>DB: Clear user's cart
        D->>DB: Reduce product stock
        D->>D: Send order confirmation email
        D-->>R: 200 {order_id, status: "confirmed"}
        R-->>U: "Order Placed Successfully!"
    else Signature Invalid
        D->>DB: Update Order status=failed
        D-->>R: 400 {error: "Payment verification failed"}
        R-->>U: "Payment Failed. Try again."
    end
```

---

## 6. Add-to-Cart Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant R as ⚛️ React
    participant D as 🐍 Django
    participant DB as 🐘 PostgreSQL
    participant RD as ⚡ Redis

    U->>R: Click "Add to Cart"
    R->>D: POST /api/cart/add/<br/>{"product_id": 5, "quantity": 1}
    D->>D: Verify JWT token

    D->>DB: Check product stock
    alt In Stock
        D->>DB: Find/create Cart for user
        D->>DB: Check if item already in cart

        alt Already in cart
            D->>DB: quantity += 1
        else New item
            D->>DB: Create CartItem
        end

        D->>RD: Update cached cart count
        D-->>R: 200 + updated cart
        R->>R: Update cart badge
        R-->>U: "Added to Cart ✓"
    else Out of Stock
        D-->>R: 400 "Product out of stock"
        R-->>U: "Sorry, out of stock"
    end
```

---

## 7. Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: Checkout initiated
    Pending --> Confirmed: Payment verified
    Pending --> Failed: Payment failed
    Failed --> Pending: Retry payment
    Confirmed --> Processing: Admin acknowledges
    Processing --> Shipped: Dispatched
    Shipped --> Delivered: Customer receives
    Delivered --> [*]

    Confirmed --> Cancelled: Customer cancels
    Processing --> Cancelled: Customer cancels
    Cancelled --> Refund_Initiated: Refund triggered
    Refund_Initiated --> Refunded: Money returned
    Refunded --> [*]

    Delivered --> Return_Requested: Within 7 days
    Return_Requested --> Return_Approved: Admin approves
    Return_Approved --> Return_Picked: Pickup scheduled
    Return_Picked --> Refund_Initiated
```

---

## 8. Django Project Structure

```
furniture-backend/
├── manage.py
├── requirements.txt
├── .env
│
├── config/                      # ⚙️ Project Configuration
│   ├── settings/
│   │   ├── base.py              # Common settings
│   │   ├── development.py       # Dev overrides
│   │   └── production.py        # Prod (Gunicorn, SSL)
│   ├── urls.py                  # Root URL routing
│   ├── celery.py                # Async task queue
│   └── wsgi.py
│
├── accounts/                    # 👤 Authentication & Users
│   ├── models.py                # CustomUser, Address
│   ├── serializers.py           # Register, Login, Profile
│   ├── views.py                 # Auth + Profile APIs
│   ├── urls.py
│   ├── signals.py               # Post-register actions
│   └── utils.py                 # Email helpers
│
├── products/                    # 🪑 Product Catalog
│   ├── models.py                # Product, Category, ProductImage
│   ├── serializers.py           # List, Detail, Search
│   ├── views.py                 # Product APIs + filters
│   ├── urls.py
│   └── filters.py               # django-filter configs
│
├── cart/                        # 🛒 Shopping Cart
│   ├── models.py                # Cart, CartItem
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
│
├── wishlist/                    # ❤️ Wishlist
│   ├── models.py                # WishlistItem
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
│
├── orders/                      # 📦 Order Management
│   ├── models.py                # Order, OrderItem
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── utils.py                 # Invoice generation
│
├── payments/                    # 💳 Payment Gateway
│   ├── models.py                # Payment, Refund
│   ├── serializers.py
│   ├── views.py                 # Razorpay/Stripe integration
│   ├── urls.py
│   ├── razorpay_client.py       # Razorpay SDK wrapper
│   └── webhooks.py              # Payment event handlers
│
├── coupons/                     # 🏷️ Discount Coupons
│   ├── models.py                # Coupon, CouponUsage
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
│
├── reviews/                     # ⭐ Product Reviews
│   ├── models.py                # Review
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
│
├── shipping/                    # 🚚 Shipping
│   ├── models.py                # ShippingMethod
│   ├── serializers.py
│   └── views.py
│
├── notifications/               # 📧 Email/SMS Notifications
│   ├── models.py                # Notification
│   ├── tasks.py                 # Celery async tasks
│   ├── templates/               # Email HTML templates
│   │   ├── welcome.html
│   │   ├── order_confirmed.html
│   │   ├── order_shipped.html
│   │   └── password_reset.html
│   └── utils.py                 # Send email/SMS helpers
│
├── analytics/                   # 📊 Dashboard Analytics
│   ├── views.py                 # Sales, users, products stats
│   └── urls.py
│
└── common/                      # 🔧 Shared Utilities
    ├── permissions.py           # IsOwner, IsAdmin
    ├── pagination.py            # Custom paginator
    ├── middleware.py             # Request logging
    └── exceptions.py            # Custom error handlers
```

---

## 9. Frontend New Pages & Components (React)

| Page / Component | Route | Description |
|---|---|---|
| **Login** | `/login` | Email + password login |
| **Register** | `/register` | Sign up with email verification |
| **Profile** | `/profile` | Edit name, phone, avatar |
| **Addresses** | `/profile/addresses` | Manage delivery addresses |
| **Cart** | `/cart` | View/edit cart items |
| **Wishlist** | `/wishlist` | Saved items |
| **Checkout** | `/checkout` | Address → Shipping → Coupon → Pay |
| **Order History** | `/orders` | List of past orders |
| **Order Detail** | `/orders/:id` | Status, items, tracking, invoice |
| **Product Reviews** | (on product page) | Star rating + comment form |

---

## 10. Tech Stack Summary

| Layer | Technology |
|---|---|
| **Frontend** | React + Vite (existing) |
| **API Framework** | Django REST Framework |
| **Authentication** | JWT (simplejwt) |
| **Database** | PostgreSQL |
| **Cache** | Redis |
| **Task Queue** | Celery + Redis |
| **Payment Gateway** | Razorpay (India) / Stripe (International) |
| **File Storage** | Cloudinary / AWS S3 |
| **Email** | Django SMTP / SendGrid |
| **SMS** | Twilio |
| **Search** | django-filter + PostgreSQL Full Text |
| **CORS** | django-cors-headers |
| **Deployment** | Gunicorn + Nginx + Docker |

---

## 11. Key Packages (requirements.txt)

```
Django>=4.2
djangorestframework>=3.14
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
django-filter>=23.5
psycopg2-binary>=2.9
python-dotenv>=1.0
Pillow>=10.0
celery>=5.3
redis>=5.0
razorpay>=1.4
stripe>=7.0
cloudinary>=1.36
gunicorn>=21.2
whitenoise>=6.5
```
