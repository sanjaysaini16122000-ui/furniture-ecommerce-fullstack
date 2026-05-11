# Furniture Store Backend API

A robust and scalable furniture e-commerce backend built with **Django 6.0** and **Django REST Framework**. This project provides a comprehensive suite of features for a modern e-commerce experience, including a unique AI-powered room visualizer.

## 🚀 Key Features

- **User Accounts**: Custom user model with JWT-based authentication (SimpleJWT).
- **Product Management**: Multi-category support, product images, and inventory tracking.
- **Shopping Experience**: Fully functional Cart and Wishlist systems.
- **Order Management**: Comprehensive order lifecycle from creation to delivery.
- **Payment Integrations**: Seamlessly integrated with **Stripe** and **Razorpay**.
- **AI Room Visualizer**: Integrated AI background removal for furniture placement visualization.
- **Administrative Dashboard**: Modern, dark-mode supported admin UI powered by **Django Unfold**.
- **Shipping & Logistics**: Integrated shipping calculations and tracking placeholders.
- **Notifications**: Automated notifications via Twilio (SMS) and Email.
- **Analytics & Reviews**: Customer review system and basic sales/interaction analytics.

## 🛠️ Tech Stack

- **Framework**: Django 6.0+, Django REST Framework (DRF)
- **Database**: PostgreSQL (Production ready) / SQLite (Development)
- **Authentication**: JWT (JSON Web Tokens)
- **Background Tasks**: Celery & Redis (Optional/Eager mode supported)
- **Styling (Admin)**: Django Unfold
- **Payment Gateways**: Stripe, Razorpay
- **Image Storage**: Cloudinary (Supported)

## 📋 Prerequisites

- Python 3.10 or higher
- Redis (Optional, for Celery tasks)

## ⚙️ Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/furniture_backend.git
    cd furniture_backend
    ```

2.  **Create and activate a virtual environment**:
    ```bash
    python -m venv .venv
    # Windows
    .venv\Scripts\activate
    # Linux/Mac
    source .venv/bin/activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add the following (see `.env.example` if available):
    ```env
    SECRET_KEY=your_secret_key
    DB_NAME=furniture_db
    DB_USER=postgres
    DB_PASSWORD=your_password
    REMOVE_BG_API_KEY=your_api_key
    STRIPE_SECRET_KEY=your_stripe_key
    ```

5.  **Run Migrations**:
    ```bash
    python manage.py migrate
    ```

6.  **Create a Superuser**:
    ```bash
    python manage.py createsuperuser
    ```

7.  **Start the Development Server**:
    ```bash
    python manage.py runserver
    ```

## 🧠 AI Background Removal

The project includes a utility script `clear_images.py` and integrations within the `visualizer` app to handle AI-based background removal, allowing users to visualize furniture in their own space.

## 📁 Project Structure

- `accounts/`: Custom user and authentication logic.
- `products/`: Product, Category, and Inventory models.
- `cart/` & `wishlist/`: Shopping experience management.
- `orders/` & `payments/`: Transactional logic and payment gateway integrations.
- `visualizer/`: AI Room Visualizer features.
- `config/`: Project settings and URL configurations.

## 📄 License

This project is licensed under the MIT License.
