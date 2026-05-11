# Project Details & Architectural Overview

This document provides a deep dive into the technical architecture, data models, and service integrations of the **Furniture Store Backend**.

## 🏗️ System Architecture

### Django App Ecosystem
The project is built using a modular app-based architecture to ensure separation of concerns:
- **Core Apps**: `accounts`, `products`, `orders`.
- **Experience Apps**: `cart`, `wishlist`, `reviews`, `visualizer`.
- **Logistics & Business**: `payments`, `shipping`, `coupons`, `notifications`.
- **Management**: `analytics`, `common`.

### Settings Structure
The project uses a split settings pattern in `config/settings/`:
- `base.py`: Shared configurations.
- `development.py`: Debug mode enabled, console email backend.
- `production.py`: Security enhancements and optimized database settings.

## 💾 Core Data Models

### Products & Categories (`products`)
- **Category**: Supports hierarchical structures with a self-referencing `parent` field.
- **Product**: Uses `JSONField` for `features` and `finishes` to provide flexible metadata without schema changes. Includes inventory tracking and automatic slug generation.
- **ProductImage**: Handles multiple images per product with a `sort_order` and `is_primary` flag.

### Ordering System (`orders`)
- **Order**: Manages the order lifecycle with statuses (`pending`, `confirmed`, `processing`, etc.). Uses UUID-based order numbers.
- **OrderItem**: Keeps a snapshot of the `unit_price` at the time of purchase to maintain historical accuracy.

### AI Room Visualizer (`visualizer`)
- **UserVisualization**: Stores the relationship between a user, a product, and an uploaded room image.
- **Placement Logic**: Uses `x_pos`, `y_pos`, `scale`, and `rotation` (decimal fields) to persist the exact placement of a furniture item in a user's uploaded room photo.

## 🔌 Service Integrations

### Payment Gateways
Dual integration for maximum flexibility:
- **Stripe**: Primary international gateway.
- **Razorpay**: Secondary domestic gateway support.
- Configurable via `.env` for secrets and public keys.

### AI & Media
- **Remove.bg**: Integrated for automated background removal of product images, ensuring high-quality overlays in the Visualizer.
- **Cloudinary**: (Optional) Supported for scalable media hosting.
- **Twilio**: Triggers SMS notifications for order confirmations and shipping updates.

## 🛡️ Authentication & API
- **SimpleJWT**: Provides stateless authentication using short-lived Access Tokens and long-lived Refresh Tokens.
- **CORS Configuration**: Open CORS in development (`CORS_ALLOW_ALL_ORIGINS = True`).
- **Standardized Responses**: Using a custom exception handler and pagination in `common/` for consistent API behavior.

## 📊 Administrative Control
- **Django Unfold**: A premium, modern dashboard that provides an editorial-style interface for managing the catalog.
- **Custom Sidebar**: Organized into "Shop", "Customers", and "Promotions" groups for intuitive management.
- **Analytics Dashboard**: Custom API endpoints for tracking site interactions and sales performance.
