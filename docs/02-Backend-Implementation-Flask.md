# Backend Implementation Plan
# Flask REST API - Decan India E-Commerce

**Version:** 3.0  
**Framework:** Flask + SQLAlchemy + PostgreSQL  
**Duration:** 6-8 Weeks  
**Date:** January 10, 2026

---

## Table of Contents

1. [Tech Stack & Architecture](#tech-stack--architecture)
2. [Project Structure](#project-structure)
3. [Setup & Installation](#setup--installation)
4. [Database Models](#database-models)
5. [API Endpoints Implementation](#api-endpoints-implementation)
6. [Authentication & Authorization](#authentication--authorization)
7. [Third-Party Integrations](#third-party-integrations)
8. [File Upload & Storage](#file-upload--storage)
9. [Error Handling & Validation](#error-handling--validation)
10. [Testing Strategy](#testing-strategy)
11. [Deployment](#deployment)
12. [Week-by-Week Plan](#week-by-week-plan)

---

## 1. Tech Stack & Architecture

### 1.1 Core Framework & Libraries

```python
# requirements.txt

# Core Framework
Flask==3.0.0
Flask-CORS==4.0.0
Flask-RESTful==0.3.10
Flask-JWT-Extended==4.6.0

# Database
SQLAlchemy==2.0.25
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.5
psycopg2-binary==2.9.9

# Validation
Flask-Marshmallow==0.15.0
marshmallow==3.20.1
marshmallow-sqlalchemy==0.29.0

# Authentication
bcrypt==4.1.2
PyJWT==2.8.0

# File Upload
Flask-Uploads==0.2.1
Pillow==10.2.0

# Environment
python-dotenv==1.0.0

# HTTP Requests
requests==2.31.0

# Date/Time
python-dateutil==2.8.2

# Task Queue (for emails, notifications)
Celery==5.3.4
Redis==5.0.1

# Payment
razorpay==1.4.1

# Email
sendgrid==6.11.0  # or use Zepto Mail API

# SMS
twilio==8.11.1     # or MSG91

# Utils
python-slugify==8.0.1
validators==0.22.0

# Development
pytest==7.4.3
pytest-flask==1.3.0
black==23.12.1
flake8==7.0.0
```

### 1.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  MOBILE APP (React Native)              │
│                  ADMIN DASHBOARD (Next.js)              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ HTTPS/REST API
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   FLASK API GATEWAY                      │
│              (Nginx Reverse Proxy)                       │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼───────┐ ┌──▼──────┐ ┌────▼─────┐
│  Auth Service │ │ API Core│ │  Workers │
│   JWT/OAuth   │ │ Routes  │ │  Celery  │
└───────┬───────┘ └──┬──────┘ └────┬─────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼───────┐ ┌──▼──────┐ ┌────▼─────┐
│  PostgreSQL   │ │  Redis  │ │ Supabase │
│   Database    │ │  Cache  │ │ Storage  │
└───────────────┘ └─────────┘ └──────────┘
```

---

## 2. Project Structure

```
flask-backend/
├── app/
│   ├── __init__.py                  # Flask app factory
│   ├── config.py                    # Configuration
│   ├── extensions.py                # Extensions initialization
│   │
│   ├── models/                      # Database models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── category.py
│   │   ├── order.py
│   │   ├── cart.py
│   │   ├── address.py
│   │   ├── review.py
│   │   ├── coupon.py
│   │   └── variant.py             # ⭐ NEW
│   │
│   ├── schemas/                     # Marshmallow schemas
│   │   ├── __init__.py
│   │   ├── user_schema.py
│   │   ├── product_schema.py
│   │   ├── order_schema.py
│   │   ├── cart_schema.py
│   │   ├── address_schema.py
│   │   ├── review_schema.py
│   │   └── variant_schema.py      # ⭐ NEW
│   │
│   ├── api/                         # API routes
│   │   ├── __init__.py
│   │   ├── auth.py                 # Authentication endpoints
│   │   ├── users.py                # User endpoints
│   │   ├── products.py             # Product endpoints
│   │   ├── categories.py           # Category endpoints
│   │   ├── cart.py                 # Cart endpoints
│   │   ├── orders.py               # Order endpoints
│   │   ├── payments.py             # Payment endpoints
│   │   ├── reviews.py              # Review endpoints
│   │   ├── wishlist.py             # Wishlist endpoints
│   │   ├── coupons.py              # Coupon endpoints
│   │   ├── uploads.py              # File upload endpoints
│   │   ├── notifications.py        # Notification endpoints
│   │   └── admin/                  # Admin endpoints
│   │       ├── __init__.py
│   │       ├── products.py         # Admin product management
│   │       ├── orders.py           # Admin order management
│   │       ├── users.py            # Admin user management
│   │       ├── analytics.py        # Analytics endpoints
│   │       ├── inventory.py        # Inventory management
│   │       └── pos.py              # POS/Offline sales ⭐ NEW
│   │
│   ├── services/                    # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── product_service.py
│   │   ├── order_service.py
│   │   ├── payment_service.py
│   │   ├── notification_service.py
│   │   ├── email_service.py
│   │   ├── sms_service.py
│   │   ├── storage_service.py
│   │   └── pos_service.py          # ⭐ NEW
│   │
│   ├── utils/                       # Utility functions
│   │   ├── __init__.py
│   │   ├── decorators.py           # Custom decorators (auth, role)
│   │   ├── validators.py           # Custom validators
│   │   ├── helpers.py              # Helper functions
│   │   ├── constants.py            # Constants
│   │   └── exceptions.py           # Custom exceptions
│   │
│   └── tasks/                       # Celery tasks
│       ├── __init__.py
│       ├── email_tasks.py
│       ├── sms_tasks.py
│       └── notification_tasks.py
│
├── migrations/                      # Database migrations
│   └── versions/
│
├── tests/                           # Test files
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_products.py
│   ├── test_orders.py
│   └── test_admin.py
│
├── .env                             # Environment variables
├── .env.example                     # Environment template
├── .gitignore
├── requirements.txt
├── requirements-dev.txt
├── run.py                           # Application entry point
├── celery_worker.py                 # Celery worker
├── pytest.ini
└── README.md
```

---

## 3. Setup & Installation

### 3.1 Environment Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install dev dependencies
pip install -r requirements-dev.txt
```

### 3.2 Environment Variables

```bash
# .env.example

# Flask
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/decan_ecommerce
# Or use Supabase connection string

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Email (Zepto Mail)
ZEPTO_API_KEY=your-zepto-api-key
ZEPTO_FROM_EMAIL=orders@decanindia.com
ZEPTO_FROM_NAME=Decan India

# SMS (MSG91)
MSG91_API_KEY=your-msg91-api-key
MSG91_SENDER_ID=DECIND

# File Upload
MAX_CONTENT_LENGTH=16777216  # 16MB
UPLOAD_FOLDER=uploads
ALLOWED_EXTENSIONS=png,jpg,jpeg,gif,webp

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:19000

# Pagination
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# JWT
JWT_ACCESS_TOKEN_EXPIRES=3600  # 1 hour
JWT_REFRESH_TOKEN_EXPIRES=2592000  # 30 days

# Admin
ADMIN_EMAIL=admin@decanindia.com
ADMIN_PASSWORD=change-this-password
```

### 3.3 Flask App Factory

```python
# app/__init__.py

from flask import Flask
from flask_cors import CORS
from app.extensions import db, migrate, jwt, ma, bcrypt
from app.config import config

def create_app(config_name='development'):
    app = Flask(__name__)
    
    # Load config
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    bcrypt.init_app(app)
    
    # CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Register blueprints
    from app.api import auth_bp, users_bp, products_bp, categories_bp
    from app.api import cart_bp, orders_bp, payments_bp, reviews_bp
    from app.api import wishlist_bp, coupons_bp, uploads_bp
    from app.api.admin import admin_products_bp, admin_orders_bp
    from app.api.admin import admin_users_bp, admin_analytics_bp
    from app.api.admin import admin_inventory_bp, admin_pos_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(wishlist_bp, url_prefix='/api/wishlist')
    app.register_blueprint(coupons_bp, url_prefix='/api/coupons')
    app.register_blueprint(uploads_bp, url_prefix='/api/uploads')
    
    # Admin routes
    app.register_blueprint(admin_products_bp, url_prefix='/api/admin/products')
    app.register_blueprint(admin_orders_bp, url_prefix='/api/admin/orders')
    app.register_blueprint(admin_users_bp, url_prefix='/api/admin/users')
    app.register_blueprint(admin_analytics_bp, url_prefix='/api/admin/analytics')
    app.register_blueprint(admin_inventory_bp, url_prefix='/api/admin/inventory')
    app.register_blueprint(admin_pos_bp, url_prefix='/api/admin/pos')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Resource not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
    
    # Health check
    @app.route('/health')
    def health():
        return {'status': 'healthy'}, 200
    
    return app
```

### 3.4 Configuration

```python
# app/config.py

import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Upload
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16777216))
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    ALLOWED_EXTENSIONS = os.getenv('ALLOWED_EXTENSIONS', 'png,jpg,jpeg,gif,webp').split(',')
    
    # Pagination
    DEFAULT_PAGE_SIZE = int(os.getenv('DEFAULT_PAGE_SIZE', 20))
    MAX_PAGE_SIZE = int(os.getenv('MAX_PAGE_SIZE', 100))
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # Razorpay
    RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID')
    RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET')
    
    # Email
    ZEPTO_API_KEY = os.getenv('ZEPTO_API_KEY')
    ZEPTO_FROM_EMAIL = os.getenv('ZEPTO_FROM_EMAIL')
    
    # SMS
    MSG91_API_KEY = os.getenv('MSG91_API_KEY')
    MSG91_SENDER_ID = os.getenv('MSG91_SENDER_ID')
    
    # Supabase
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')
    SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
    
    # Redis
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_ECHO = False

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
```

### 3.5 Extensions

```python
# app/extensions.py

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
ma = Marshmallow()
bcrypt = Bcrypt()
```

---

## 4. Database Models

### 4.1 User Model

```python
# app/models/user.py

from app.extensions import db, bcrypt
from datetime import datetime
import uuid

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    mobile = db.Column(db.String(15), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    is_active = db.Column(db.Boolean, default=True)
    profile_image = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    addresses = db.relationship('Address', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='user', lazy='dynamic')
    cart_items = db.relationship('CartItem', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='user', lazy='dynamic')
    wishlist = db.relationship('Wishlist', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'mobile': self.mobile,
            'role': self.role,
            'is_active': self.is_active,
            'profile_image': self.profile_image,
            'created_at': self.created_at.isoformat(),
        }
```

### 4.2 Product Model

```python
# app/models/product.py

from app.extensions import db
from datetime import datetime
import uuid

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sku = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False, index=True)
    slug = db.Column(db.String(255), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    short_description = db.Column(db.String(500))
    category_id = db.Column(db.String(36), db.ForeignKey('categories.id'), index=True)
    
    # Pricing (base price if no variants)
    base_price = db.Column(db.Numeric(10, 2), nullable=False)
    original_price = db.Column(db.Numeric(10, 2))
    discount_percentage = db.Column(db.Integer, default=0)
    
    # Inventory (if no variants)
    stock_quantity = db.Column(db.Integer, default=0)
    low_stock_threshold = db.Column(db.Integer, default=10)
    
    # Variant support
    has_variants = db.Column(db.Boolean, default=False)  # ⭐ NEW
    
    # Meta
    is_active = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)
    view_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = db.relationship('Category', backref='products')
    images = db.relationship('ProductImage', backref='product', lazy='dynamic', cascade='all, delete-orphan')
    variants = db.relationship('ProductVariant', backref='product', lazy='dynamic', cascade='all, delete-orphan')  # ⭐ NEW
    reviews = db.relationship('Review', backref='product', lazy='dynamic')
    cart_items = db.relationship('CartItem', backref='product', lazy='dynamic')
    
    @property
    def average_rating(self):
        ratings = [r.rating for r in self.reviews.all()]
        return sum(ratings) / len(ratings) if ratings else 0
    
    @property
    def total_reviews(self):
        return self.reviews.count()
    
    @property
    def primary_image(self):
        image = self.images.filter_by(is_primary=True).first()
        return image.image_url if image else None
    
    def to_dict(self):
        return {
            'id': self.id,
            'sku': self.sku,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'short_description': self.short_description,
            'category_id': self.category_id,
            'base_price': float(self.base_price),
            'original_price': float(self.original_price) if self.original_price else None,
            'discount_percentage': self.discount_percentage,
            'stock_quantity': self.stock_quantity,
            'has_variants': self.has_variants,
            'is_active': self.is_active,
            'is_featured': self.is_featured,
            'average_rating': self.average_rating,
            'total_reviews': self.total_reviews,
            'primary_image': self.primary_image,
            'created_at': self.created_at.isoformat(),
        }
```

### 4.3 Product Variant Model ⭐ NEW

```python
# app/models/variant.py

from app.extensions import db
from datetime import datetime
import uuid

class ProductVariant(db.Model):
    __tablename__ = 'product_variants'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False, index=True)
    
    # Variant details
    variant_type = db.Column(db.String(50), nullable=False)  # 'size', 'color', 'material'
    variant_name = db.Column(db.String(100), nullable=False)  # 'Small', 'Medium', 'Large'
    sku = db.Column(db.String(50), unique=True, nullable=False, index=True)
    
    # Pricing
    price = db.Column(db.Numeric(10, 2), nullable=False)
    original_price = db.Column(db.Numeric(10, 2))
    
    # Inventory
    stock_quantity = db.Column(db.Integer, default=0)
    
    # Physical attributes (optional)
    weight = db.Column(db.Numeric(10, 2))  # in kg
    dimensions = db.Column(db.String(100))  # "10x20x30 cm"
    
    # Meta
    is_active = db.Column(db.Boolean, default=True)
    display_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cart_items = db.relationship('CartItem', backref='variant', lazy='dynamic')
    order_items = db.relationship('OrderItem', backref='variant', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'variant_type': self.variant_type,
            'variant_name': self.variant_name,
            'sku': self.sku,
            'price': float(self.price),
            'original_price': float(self.original_price) if self.original_price else None,
            'stock_quantity': self.stock_quantity,
            'weight': float(self.weight) if self.weight else None,
            'dimensions': self.dimensions,
            'is_active': self.is_active,
            'display_order': self.display_order,
        }
```

### 4.4 Order Model

```python
# app/models/order.py

from app.extensions import db
from datetime import datetime
import uuid

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    address_id = db.Column(db.String(36), db.ForeignKey('addresses.id'))
    
    # Pricing
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    discount_amount = db.Column(db.Numeric(10, 2), default=0)
    tax_amount = db.Column(db.Numeric(10, 2), default=0)
    delivery_charge = db.Column(db.Numeric(10, 2), default=0)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Payment
    payment_method = db.Column(db.String(20))  # 'cod', 'razorpay'
    payment_status = db.Column(db.String(20), default='pending')  # 'pending', 'paid', 'failed', 'refunded'
    razorpay_order_id = db.Column(db.String(100))
    razorpay_payment_id = db.Column(db.String(100))
    razorpay_signature = db.Column(db.String(255))
    
    # Order Status
    status = db.Column(db.String(20), default='placed')  # 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled'
    
    # Order Source ⭐ NEW
    source = db.Column(db.String(20), default='online')  # 'online' or 'offline'
    pos_user_id = db.Column(db.String(36), db.ForeignKey('users.id'))  # Admin who created offline sale
    payment_mode_offline = db.Column(db.String(20))  # 'cash', 'card', 'upi' for offline orders
    
    # Coupon
    coupon_code = db.Column(db.String(50))
    
    # Notes
    customer_notes = db.Column(db.Text)
    admin_notes = db.Column(db.Text)
    
    # Tracking
    tracking_number = db.Column(db.String(100))
    carrier_name = db.Column(db.String(100))
    
    # Timestamps
    placed_at = db.Column(db.DateTime, default=datetime.utcnow)
    confirmed_at = db.Column(db.DateTime)
    shipped_at = db.Column(db.DateTime)
    delivered_at = db.Column(db.DateTime)
    cancelled_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    address = db.relationship('Address', foreign_keys=[address_id])
    pos_user = db.relationship('User', foreign_keys=[pos_user_id])
    items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'user_id': self.user_id,
            'subtotal': float(self.subtotal),
            'discount_amount': float(self.discount_amount),
            'tax_amount': float(self.tax_amount),
            'delivery_charge': float(self.delivery_charge),
            'total_amount': float(self.total_amount),
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'status': self.status,
            'source': self.source,
            'placed_at': self.placed_at.isoformat(),
        }
```

### 4.5 Cart Model

```python
# app/models/cart.py

from app.extensions import db
from datetime import datetime
import uuid

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False, index=True)
    variant_id = db.Column(db.String(36), db.ForeignKey('product_variants.id'))  # ⭐ NEW
    quantity = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'product_id', 'variant_id', name='unique_cart_item'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'variant_id': self.variant_id,
            'quantity': self.quantity,
            'created_at': self.created_at.isoformat(),
        }
```

### 4.6 Additional Models

```python
# app/models/category.py
class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False, unique=True)
    slug = db.Column(db.String(100), nullable=False, unique=True, index=True)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    parent_id = db.Column(db.String(36), db.ForeignKey('categories.id'))
    is_active = db.Column(db.Boolean, default=True)
    display_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Self-referential relationship
    children = db.relationship('Category', backref=db.backref('parent', remote_side=[id]))

# app/models/address.py
class Address(db.Model):
    __tablename__ = 'addresses'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    address_line1 = db.Column(db.String(255), nullable=False)
    address_line2 = db.Column(db.String(255))
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# app/models/review.py
class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text)
    is_approved = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('product_id', 'user_id', name='unique_product_review'),
    )
    
    # Relationship for images
    images = db.relationship('ReviewImage', backref='review', lazy='dynamic', cascade='all, delete-orphan')

# app/models/coupon.py
class Coupon(db.Model):
    __tablename__ = 'coupons'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    discount_type = db.Column(db.String(20), nullable=False)  # 'percentage', 'fixed'
    discount_value = db.Column(db.Numeric(10, 2), nullable=False)
    min_order_value = db.Column(db.Numeric(10, 2), default=0)
    max_discount = db.Column(db.Numeric(10, 2))
    usage_limit = db.Column(db.Integer)
    used_count = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    valid_from = db.Column(db.DateTime, default=datetime.utcnow)
    valid_until = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

---

## 5. API Endpoints Implementation

### 5.1 Authentication Endpoints

```python
# app/api/auth.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.models.user import User
from app.extensions import db
from app.services.email_service import send_welcome_email
from app.services.sms_service import send_otp

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register new user
    ---
    Request:
    {
        "full_name": "John Doe",
        "email": "john@example.com",
        "mobile": "9876543210",
        "password": "Password123"
    }
    """
    data = request.get_json()
    
    # Validation
    if not all(k in data for k in ['full_name', 'email', 'mobile', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check existing user
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    if User.query.filter_by(mobile=data['mobile']).first():
        return jsonify({'error': 'Mobile already registered'}), 400
    
    # Create user
    user = User(
        full_name=data['full_name'],
        email=data['email'],
        mobile=data['mobile']
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Send welcome email (async)
    send_welcome_email.delay(user.email, user.full_name)
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user
    ---
    Request:
    {
        "email": "john@example.com",
        "password": "Password123"
    }
    """
    data = request.get_json()
    
    # Find user
    user = User.query.filter_by(email=data.get('email')).first()
    
    if not user or not user.check_password(data.get('password')):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 403
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user details"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client should discard token)"""
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    
    return jsonify({'access_token': access_token}), 200
```

### 5.2 Product Endpoints

```python
# app/api/products.py

from flask import Blueprint, request, jsonify
from app.models.product import Product
from app.models.variant import ProductVariant
from app.extensions import db
from sqlalchemy import or_

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    """
    Get products with filters, sort, pagination
    ---
    Query params:
    - category_id: Filter by category
    - search: Search by name
    - min_price: Min price
    - max_price: Max price
    - sort: price_asc, price_desc, newest, rating
    - page: Page number (default: 1)
    - limit: Items per page (default: 20)
    """
    # Get query params
    category_id = request.args.get('category_id')
    search = request.args.get('search')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    sort = request.args.get('sort', 'newest')
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    
    # Build query
    query = Product.query.filter_by(is_active=True)
    
    # Filters
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f'%{search}%'),
                Product.description.ilike(f'%{search}%')
            )
        )
    
    if min_price:
        query = query.filter(Product.base_price >= min_price)
    
    if max_price:
        query = query.filter(Product.base_price <= max_price)
    
    # Sorting
    if sort == 'price_asc':
        query = query.order_by(Product.base_price.asc())
    elif sort == 'price_desc':
        query = query.order_by(Product.base_price.desc())
    elif sort == 'rating':
        # Sort by average rating (complex, may need raw SQL)
        pass
    else:  # newest
        query = query.order_by(Product.created_at.desc())
    
    # Pagination
    pagination = query.paginate(page=page, per_page=limit, error_out=False)
    
    products = [p.to_dict() for p in pagination.items]
    
    return jsonify({
        'products': products,
        'page': page,
        'limit': limit,
        'total': pagination.total,
        'pages': pagination.pages
    }), 200

@products_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get single product details with variants"""
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    # Increment view count
    product.view_count += 1
    db.session.commit()
    
    # Get product data
    product_data = product.to_dict()
    
    # Get images
    product_data['images'] = [
        {'id': img.id, 'url': img.image_url, 'is_primary': img.is_primary}
        for img in product.images.all()
    ]
    
    # Get variants if product has variants
    if product.has_variants:
        variants = ProductVariant.query.filter_by(
            product_id=product_id,
            is_active=True
        ).order_by(ProductVariant.display_order).all()
        
        product_data['variants'] = [v.to_dict() for v in variants]
    
    # Get reviews (first 5)
    reviews = product.reviews.order_by(Review.created_at.desc()).limit(5).all()
    product_data['reviews'] = [r.to_dict() for r in reviews]
    
    return jsonify(product_data), 200

@products_bp.route('/<product_id>/variants', methods=['GET'])
def get_product_variants(product_id):
    """Get all variants of a product"""
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    if not product.has_variants:
        return jsonify({'error': 'Product has no variants'}), 400
    
    variants = ProductVariant.query.filter_by(
        product_id=product_id,
        is_active=True
    ).order_by(ProductVariant.display_order).all()
    
    return jsonify({
        'product_id': product_id,
        'variants': [v.to_dict() for v in variants]
    }), 200
```

### 5.3 Cart Endpoints

```python
# app/api/cart.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.cart import CartItem
from app.models.product import Product
from app.models.variant import ProductVariant
from app.extensions import db

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/', methods=['GET'])
@jwt_required()
def get_cart():
    """Get user's cart"""
    user_id = get_jwt_identity()
    
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    
    items = []
    total = 0
    
    for item in cart_items:
        product = item.product
        
        # Get price based on variant or base price
        if item.variant_id:
            variant = item.variant
            price = float(variant.price)
            stock = variant.stock_quantity
            variant_data = variant.to_dict()
        else:
            price = float(product.base_price)
            stock = product.stock_quantity
            variant_data = None
        
        item_total = price * item.quantity
        total += item_total
        
        items.append({
            'id': item.id,
            'product': product.to_dict(),
            'variant': variant_data,
            'quantity': item.quantity,
            'price': price,
            'total': item_total,
            'stock': stock
        })
    
    return jsonify({
        'items': items,
        'total': total,
        'item_count': len(items)
    }), 200

@cart_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    """
    Add item to cart
    ---
    Request:
    {
        "product_id": "uuid",
        "variant_id": "uuid" (optional),
        "quantity": 1
    }
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    product_id = data.get('product_id')
    variant_id = data.get('variant_id')
    quantity = data.get('quantity', 1)
    
    # Validate product
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    # Check if product has variants and variant_id is required
    if product.has_variants and not variant_id:
        return jsonify({'error': 'Variant selection required'}), 400
    
    # Validate variant if provided
    if variant_id:
        variant = ProductVariant.query.get(variant_id)
        if not variant or variant.product_id != product_id:
            return jsonify({'error': 'Invalid variant'}), 400
        
        # Check stock
        if variant.stock_quantity < quantity:
            return jsonify({'error': 'Insufficient stock'}), 400
    else:
        # Check stock for product without variant
        if product.stock_quantity < quantity:
            return jsonify({'error': 'Insufficient stock'}), 400
    
    # Check if item already in cart
    existing_item = CartItem.query.filter_by(
        user_id=user_id,
        product_id=product_id,
        variant_id=variant_id
    ).first()
    
    if existing_item:
        # Update quantity
        existing_item.quantity += quantity
        db.session.commit()
        return jsonify({
            'message': 'Cart updated',
            'cart_item': existing_item.to_dict()
        }), 200
    else:
        # Add new item
        cart_item = CartItem(
            user_id=user_id,
            product_id=product_id,
            variant_id=variant_id,
            quantity=quantity
        )
        db.session.add(cart_item)
        db.session.commit()
        
        return jsonify({
            'message': 'Added to cart',
            'cart_item': cart_item.to_dict()
        }), 201

@cart_bp.route('/update/<cart_item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(cart_item_id):
    """Update cart item quantity"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    quantity = data.get('quantity')
    if not quantity or quantity < 1:
        return jsonify({'error': 'Invalid quantity'}), 400
    
    cart_item = CartItem.query.filter_by(id=cart_item_id, user_id=user_id).first()
    
    if not cart_item:
        return jsonify({'error': 'Cart item not found'}), 404
    
    # Check stock
    if cart_item.variant_id:
        stock = cart_item.variant.stock_quantity
    else:
        stock = cart_item.product.stock_quantity
    
    if stock < quantity:
        return jsonify({'error': 'Insufficient stock'}), 400
    
    cart_item.quantity = quantity
    db.session.commit()
    
    return jsonify({
        'message': 'Cart updated',
        'cart_item': cart_item.to_dict()
    }), 200

@cart_bp.route('/remove/<cart_item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(cart_item_id):
    """Remove item from cart"""
    user_id = get_jwt_identity()
    
    cart_item = CartItem.query.filter_by(id=cart_item_id, user_id=user_id).first()
    
    if not cart_item:
        return jsonify({'error': 'Cart item not found'}), 404
    
    db.session.delete(cart_item)
    db.session.commit()
    
    return jsonify({'message': 'Item removed from cart'}), 200

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    """Clear entire cart"""
    user_id = get_jwt_identity()
    
    CartItem.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    
    return jsonify({'message': 'Cart cleared'}), 200
```

### 5.4 Admin POS Endpoints ⭐ NEW

```python
# app/api/admin/pos.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.variant import ProductVariant
from app.models.user import User
from app.extensions import db
from app.utils.decorators import admin_required
from datetime import datetime
import uuid

admin_pos_bp = Blueprint('admin_pos', __name__)

@admin_pos_bp.route('/search-product', methods=['GET'])
@jwt_required()
@admin_required
def search_product():
    """
    Search product for POS
    Query params: q (search query), by (name, sku, barcode)
    """
    query = request.args.get('q', '')
    search_by = request.args.get('by', 'name')  # name, sku, barcode
    
    if not query:
        return jsonify({'products': []}), 200
    
    # Search products
    if search_by == 'sku':
        products = Product.query.filter(
            Product.sku.ilike(f'%{query}%'),
            Product.is_active == True
        ).limit(20).all()
    else:  # name
        products = Product.query.filter(
            Product.name.ilike(f'%{query}%'),
            Product.is_active == True
        ).limit(20).all()
    
    results = []
    for product in products:
        product_data = product.to_dict()
        
        # Get variants if product has variants
        if product.has_variants:
            variants = ProductVariant.query.filter_by(
                product_id=product.id,
                is_active=True
            ).all()
            product_data['variants'] = [v.to_dict() for v in variants]
        
        results.append(product_data)
    
    return jsonify({'products': results}), 200

@admin_pos_bp.route('/create-sale', methods=['POST'])
@jwt_required()
@admin_required
def create_offline_sale():
    """
    Create offline/POS sale
    ---
    Request:
    {
        "items": [
            {
                "product_id": "uuid",
                "variant_id": "uuid" (optional),
                "quantity": 1
            }
        ],
        "customer_phone": "9876543210" (optional),
        "payment_method": "cash|card|upi",
        "notes": "Optional notes"
    }
    """
    admin_user_id = get_jwt_identity()
    data = request.get_json()
    
    items_data = data.get('items', [])
    if not items_data:
        return jsonify({'error': 'No items provided'}), 400
    
    payment_method = data.get('payment_method', 'cash')
    customer_phone = data.get('customer_phone')
    notes = data.get('notes', '')
    
    # Find or create customer (optional)
    customer = None
    if customer_phone:
        customer = User.query.filter_by(mobile=customer_phone).first()
        # If not found, create walk-in customer
        if not customer:
            customer = User(
                full_name=f"Walk-in Customer",
                email=f"walkin_{uuid.uuid4().hex[:8]}@decanindia.com",
                mobile=customer_phone,
                password_hash="N/A"  # No password for walk-in
            )
            db.session.add(customer)
            db.session.flush()
    
    # Calculate totals
    subtotal = 0
    order_items = []
    
    for item_data in items_data:
        product_id = item_data.get('product_id')
        variant_id = item_data.get('variant_id')
        quantity = item_data.get('quantity', 1)
        
        # Get product
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': f'Product {product_id} not found'}), 404
        
        # Get price and update stock
        if variant_id:
            variant = ProductVariant.query.get(variant_id)
            if not variant:
                return jsonify({'error': f'Variant {variant_id} not found'}), 404
            
            if variant.stock_quantity < quantity:
                return jsonify({'error': f'Insufficient stock for {product.name} - {variant.variant_name}'}), 400
            
            price = float(variant.price)
            variant.stock_quantity -= quantity
            
            order_items.append({
                'product': product,
                'variant': variant,
                'quantity': quantity,
                'price': price
            })
        else:
            if product.stock_quantity < quantity:
                return jsonify({'error': f'Insufficient stock for {product.name}'}), 400
            
            price = float(product.base_price)
            product.stock_quantity -= quantity
            
            order_items.append({
                'product': product,
                'variant': None,
                'quantity': quantity,
                'price': price
            })
        
        subtotal += price * quantity
    
    # Calculate tax and total
    tax_amount = subtotal * 0.18  # 18% GST
    total_amount = subtotal + tax_amount
    
    # Generate order number
    order_number = f"OFF{datetime.now().strftime('%Y%m%d')}{uuid.uuid4().hex[:6].upper()}"
    
    # Create order
    order = Order(
        order_number=order_number,
        user_id=customer.id if customer else None,
        subtotal=subtotal,
        tax_amount=tax_amount,
        total_amount=total_amount,
        payment_method='offline',
        payment_mode_offline=payment_method,
        payment_status='paid',  # Offline sales are paid immediately
        status='confirmed',  # Skip placed, go straight to confirmed
        source='offline',
        pos_user_id=admin_user_id,
        admin_notes=notes
    )
    
    db.session.add(order)
    db.session.flush()
    
    # Create order items
    for item_info in order_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_info['product'].id,
            variant_id=item_info['variant'].id if item_info['variant'] else None,
            product_name=item_info['product'].name,
            product_sku=item_info['variant'].sku if item_info['variant'] else item_info['product'].sku,
            variant_name=item_info['variant'].variant_name if item_info['variant'] else None,
            quantity=item_info['quantity'],
            price=item_info['price'],
            total=item_info['price'] * item_info['quantity']
        )
        db.session.add(order_item)
    
    db.session.commit()
    
    # Return order details
    return jsonify({
        'message': 'Sale completed successfully',
        'order': {
            'order_number': order.order_number,
            'total_amount': float(total_amount),
            'payment_method': payment_method,
            'items_count': len(order_items)
        }
    }), 201

@admin_pos_bp.route('/daily-sales', methods=['GET'])
@jwt_required()
@admin_required
def get_daily_sales():
    """Get today's offline sales summary"""
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    orders = Order.query.filter(
        Order.source == 'offline',
        Order.placed_at >= today_start
    ).all()
    
    total_sales = sum(float(order.total_amount) for order in orders)
    total_orders = len(orders)
    
    # Group by payment method
    payment_breakdown = {}
    for order in orders:
        method = order.payment_mode_offline
        payment_breakdown[method] = payment_breakdown.get(method, 0) + float(order.total_amount)
    
    return jsonify({
        'date': today_start.isoformat(),
        'total_orders': total_orders,
        'total_sales': total_sales,
        'payment_breakdown': payment_breakdown,
        'orders': [o.to_dict() for o in orders]
    }), 200
```

---

## 6. Authentication & Authorization

### 6.1 JWT Authentication

```python
# app/utils/decorators.py

from functools import wraps
from flask_jwt_extended import get_jwt_identity
from flask import jsonify
from app.models.user import User

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper

def active_user_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Account is inactive'}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper
```

---

## 7. Third-Party Integrations

### 7.1 Razorpay Payment

```python
# app/services/payment_service.py

import razorpay
from flask import current_app
import hmac
import hashlib

class PaymentService:
    def __init__(self):
        self.client = razorpay.Client(auth=(
            current_app.config['RAZORPAY_KEY_ID'],
            current_app.config['RAZORPAY_KEY_SECRET']
        ))
    
    def create_order(self, amount, currency='INR', receipt=None):
        """Create Razorpay order"""
        data = {
            'amount': int(amount * 100),  # Convert to paise
            'currency': currency,
            'receipt': receipt or f"ORDER_{uuid.uuid4().hex[:10]}"
        }
        
        order = self.client.order.create(data=data)
        return order
    
    def verify_signature(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        """Verify Razorpay payment signature"""
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        
        generated_signature = hmac.new(
            current_app.config['RAZORPAY_KEY_SECRET'].encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(generated_signature, razorpay_signature)
```

### 7.2 Email Service (Zepto Mail)

```python
# app/services/email_service.py

import requests
from flask import current_app

class EmailService:
    def __init__(self):
        self.api_key = current_app.config['ZEPTO_API_KEY']
        self.from_email = current_app.config['ZEPTO_FROM_EMAIL']
        self.from_name = current_app.config['ZEPTO_FROM_NAME']
        self.api_url = 'https://api.zeptomail.in/v1.1/email'
    
    def send_email(self, to_email, subject, html_body):
        """Send email via Zepto Mail"""
        headers = {
            'Authorization': f'Zoho-enczapikey {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'from': {
                'address': self.from_email,
                'name': self.from_name
            },
            'to': [{'email_address': {'address': to_email}}],
            'subject': subject,
            'htmlbody': html_body
        }
        
        response = requests.post(self.api_url, json=data, headers=headers)
        return response.json()
```

### 7.3 SMS Service (MSG91)

```python
# app/services/sms_service.py

import requests
from flask import current_app

class SMSService:
    def __init__(self):
        self.api_key = current_app.config['MSG91_API_KEY']
        self.sender_id = current_app.config['MSG91_SENDER_ID']
        self.api_url = 'https://api.msg91.com/api/v5/flow/'
    
    def send_sms(self, mobile, message):
        """Send SMS via MSG91"""
        headers = {
            'authkey': self.api_key,
            'Content-Type': 'application/json'
        }
        
        data = {
            'sender': self.sender_id,
            'mobiles': mobile,
            'message': message
        }
        
        response = requests.post(self.api_url, json=data, headers=headers)
        return response.json()
```

---

## 8. Week-by-Week Implementation Plan

### Week 1: Setup & Core Models (30 hours)
- Day 1-2: Project setup, dependencies, config
- Day 3-4: Database models (User, Product, Variant, Category)
- Day 5: Auth endpoints

### Week 2: Product & Cart APIs (40 hours)
- Day 1-2: Product endpoints
- Day 3: Variant endpoints
- Day 4: Cart endpoints
- Day 5: Category endpoints

### Week 3: Orders & Payment (40 hours)
- Day 1-2: Order creation
- Day 3: Razorpay integration
- Day 4: Order management
- Day 5: COD flow

### Week 4: Admin APIs (35 hours)
- Day 1-2: Admin product management
- Day 3: Admin order management
- Day 4: Admin user management
- Day 5: POS endpoints ⭐

### Week 5: Additional Features (30 hours)
- Day 1: Reviews & wishlist
- Day 2: Coupons
- Day 3: Notifications
- Day 4: File upload
- Day 5: Analytics endpoints

### Week 6: Integration & Testing (25 hours)
- Day 1-2: Email/SMS integration
- Day 3: Testing
- Day 4: Bug fixes
- Day 5: Documentation

### Week 7-8: Deployment & Polish (20 hours)
- Production setup
- Deployment
- Monitoring
- Final testing

**Total:** ~220 hours over 8 weeks

---

## 9. Deployment

### 9.1 Production Setup

```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 "app:create_app('production')"
```

### 9.2 Docker Setup

```dockerfile
# Dockerfile

FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:create_app('production')"]
```

### 9.3 Environment

Deploy to:
- AWS EC2
- Azure App Service
- Google Cloud Run
- DigitalOcean
- Heroku

---

## Summary

This Flask backend provides:
✅ Complete REST API  
✅ JWT authentication  
✅ Product variants support  
✅ POS/Offline sales  
✅ Payment integration  
✅ Admin endpoints  
✅ Scalable architecture  

**Ready to implement! 🚀**
