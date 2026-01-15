# Backend Development Phases
## Flask API - Decan India E-Commerce

**Tech Stack:** Flask + Supabase (PostgreSQL) + JWT Auth + Razorpay + Zepto Mail

---

## PHASE 1: Foundation & Authentication

### Part A: Project Setup

#### Flask Project Structure
- [ ] Create Flask project
- [ ] Setup virtual environment
- [ ] Install dependencies:
  - [ ] Flask
  - [ ] Flask-CORS
  - [ ] Flask-JWT-Extended
  - [ ] Supabase Python client
  - [ ] python-dotenv
  - [ ] Werkzeug (password hashing)
- [ ] Create folder structure:
  ```
  backend/
  ├── app/
  │   ├── __init__.py
  │   ├── config.py
  │   ├── routes/
  │   ├── models/
  │   ├── services/
  │   └── utils/
  ├── migrations/
  ├── .env
  ├── requirements.txt
  └── run.py
  ```

#### Supabase Setup
- [ ] Create Supabase project
- [ ] Configure connection in .env
- [ ] Create Supabase client wrapper
- [ ] Test database connection

#### Database Models - Users
- [ ] Users table:
  ```sql
  - id (UUID, PK)
  - full_name (VARCHAR)
  - email (VARCHAR, unique)
  - mobile (VARCHAR, unique)
  - password_hash (VARCHAR)
  - profile_image (VARCHAR, nullable)
  - is_active (BOOLEAN, default true)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
  ```

#### Database Models - Admins
- [ ] Admins table:
  ```sql
  - id (UUID, PK)
  - full_name (VARCHAR)
  - email (VARCHAR, unique)
  - password_hash (VARCHAR)
  - role (VARCHAR, default 'admin')
  - is_active (BOOLEAN)
  - created_at (TIMESTAMP)
  ```

#### JWT Auth Setup
- [ ] Configure JWT secret key
- [ ] Setup access token (15 min expiry)
- [ ] Setup refresh token (7 days expiry)
- [ ] Create auth decorators:
  - [ ] @jwt_required
  - [ ] @admin_required

### Part B: Auth APIs

#### User Auth Endpoints
- [ ] POST /api/auth/register
  - [ ] Validate input (email, mobile, password)
  - [ ] Check email/mobile uniqueness
  - [ ] Hash password
  - [ ] Create user
  - [ ] Return user data + tokens

- [ ] POST /api/auth/login
  - [ ] Validate credentials
  - [ ] Check user is active
  - [ ] Generate tokens
  - [ ] Return user data + tokens

- [ ] POST /api/auth/logout
  - [ ] Invalidate token (optional: blacklist)
  - [ ] Return success

- [ ] POST /api/auth/forgot-password
  - [ ] Validate email exists
  - [ ] Generate reset token (6 digit OTP or link)
  - [ ] Store reset token with expiry
  - [ ] Return success (email will be sent in Phase 6)

- [ ] POST /api/auth/reset-password
  - [ ] Validate reset token
  - [ ] Update password
  - [ ] Clear reset token
  - [ ] Return success

- [ ] GET /api/auth/me
  - [ ] Return current user data

- [ ] POST /api/auth/refresh-token
  - [ ] Validate refresh token
  - [ ] Generate new access token
  - [ ] Return new tokens

#### Admin Auth Endpoints
- [ ] POST /api/admin/auth/login
  - [ ] Validate admin credentials
  - [ ] Generate admin tokens
  - [ ] Return admin data + tokens

#### Seed Data
- [ ] Create seed script for test admin user

---

## PHASE 2: Products & Categories

### Part A: Database Models

#### Categories Table
- [ ] Categories table:
  ```sql
  - id (UUID, PK)
  - name (VARCHAR)
  - slug (VARCHAR, unique)
  - description (TEXT, nullable)
  - image_url (VARCHAR, nullable)
  - parent_id (UUID, FK to categories, nullable)
  - display_order (INT)
  - is_active (BOOLEAN)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
  ```

#### Products Table
- [ ] Products table:
  ```sql
  - id (UUID, PK)
  - sku (VARCHAR, unique)
  - name (VARCHAR)
  - slug (VARCHAR, unique)
  - short_description (VARCHAR)
  - description (TEXT)
  - category_id (UUID, FK)
  - base_price (DECIMAL)
  - original_price (DECIMAL, nullable)
  - has_variants (BOOLEAN)
  - stock_quantity (INT) -- for non-variant products
  - low_stock_threshold (INT, default 10)
  - is_active (BOOLEAN)
  - average_rating (DECIMAL, default 0)
  - total_reviews (INT, default 0)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
  ```

#### Product Variants Table
- [ ] Product_Variants table:
  ```sql
  - id (UUID, PK)
  - product_id (UUID, FK)
  - variant_type (VARCHAR) -- 'size', 'quantity', etc.
  - variant_name (VARCHAR) -- '1mm', '100pcs', etc.
  - sku (VARCHAR, unique)
  - price (DECIMAL)
  - original_price (DECIMAL, nullable)
  - stock_quantity (INT)
  - display_order (INT)
  - is_active (BOOLEAN)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
  ```

#### Product Images Table
- [ ] Product_Images table:
  ```sql
  - id (UUID, PK)
  - product_id (UUID, FK)
  - image_url (VARCHAR)
  - is_primary (BOOLEAN)
  - display_order (INT)
  - created_at (TIMESTAMP)
  ```

### Part B: Product & Category APIs

#### Public Category Endpoints
- [ ] GET /api/categories
  - [ ] Return all active categories
  - [ ] Include product count
  - [ ] Tree structure (parent-child)

- [ ] GET /api/categories/:id
  - [ ] Return category details

- [ ] GET /api/categories/:id/products
  - [ ] Return products in category
  - [ ] Support pagination

#### Public Product Endpoints
- [ ] GET /api/products
  - [ ] Query params:
    - [ ] category_id
    - [ ] search
    - [ ] min_price, max_price
    - [ ] min_rating
    - [ ] in_stock (boolean)
    - [ ] sort (price_asc, price_desc, newest, rating)
    - [ ] page, limit
  - [ ] Return products with pagination
  - [ ] Include primary image, category name

- [ ] GET /api/products/:id
  - [ ] Return product with:
    - [ ] All images
    - [ ] All variants (if has_variants)
    - [ ] Category info

- [ ] GET /api/products/:id/variants
  - [ ] Return product variants

- [ ] GET /api/products/search
  - [ ] Search by name, SKU
  - [ ] Return matching products

- [ ] GET /api/products/featured
  - [ ] Return featured/promoted products

- [ ] GET /api/products/latest
  - [ ] Return newest products

#### Admin Product Endpoints
- [ ] POST /api/admin/products
  - [ ] Create product with variants and images
  - [ ] Validate required fields
  - [ ] Generate SKU if not provided

- [ ] PUT /api/admin/products/:id
  - [ ] Update product details

- [ ] DELETE /api/admin/products/:id
  - [ ] Soft delete or hard delete

- [ ] POST /api/admin/products/:id/images
  - [ ] Upload product images to Supabase Storage
  - [ ] Return image URLs

- [ ] DELETE /api/admin/products/:id/images/:imageId
  - [ ] Delete product image

- [ ] POST /api/admin/products/:id/variants
  - [ ] Add variant to product

- [ ] PUT /api/admin/products/:id/variants/:variantId
  - [ ] Update variant

- [ ] DELETE /api/admin/products/:id/variants/:variantId
  - [ ] Delete variant

#### Admin Category Endpoints
- [ ] POST /api/admin/categories
  - [ ] Create category

- [ ] PUT /api/admin/categories/:id
  - [ ] Update category

- [ ] DELETE /api/admin/categories/:id
  - [ ] Delete category (check no products)

#### Seed Data
- [ ] Create seed script for:
  - [ ] Sample categories
  - [ ] Sample products with variants

---

## PHASE 3: Cart, Wishlist & Orders

### Part A: Database Models

#### Cart Items Table
- [ ] Cart_Items table:
  ```sql
  - id (UUID, PK)
  - user_id (UUID, FK)
  - product_id (UUID, FK)
  - variant_id (UUID, FK, nullable)
  - quantity (INT)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
  ```

#### Wishlist Table
- [ ] Wishlist table:
  ```sql
  - id (UUID, PK)
  - user_id (UUID, FK)
  - product_id (UUID, FK)
  - created_at (TIMESTAMP)
  ```

#### Addresses Table
- [ ] Addresses table:
  ```sql
  - id (UUID, PK)
  - user_id (UUID, FK)
  - full_name (VARCHAR)
  - mobile (VARCHAR)
  - address_line1 (VARCHAR)
  - address_line2 (VARCHAR, nullable)
  - city (VARCHAR)
  - state (VARCHAR)
  - pincode (VARCHAR)
  - address_type (VARCHAR) -- 'home', 'work', 'other'
  - is_default (BOOLEAN)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
  ```

#### Coupons Table
- [ ] Coupons table:
  ```sql
  - id (UUID, PK)
  - code (VARCHAR, unique)
  - description (VARCHAR)
  - discount_type (VARCHAR) -- 'percentage', 'fixed'
  - discount_value (DECIMAL)
  - max_discount (DECIMAL, nullable)
  - min_order_value (DECIMAL)
  - usage_limit (INT, nullable)
  - usage_count (INT, default 0)
  - per_user_limit (INT, default 1)
  - valid_from (TIMESTAMP)
  - valid_to (TIMESTAMP)
  - is_active (BOOLEAN)
  - created_at (TIMESTAMP)
  ```

#### Orders Table
- [ ] Orders table:
  ```sql
  - id (UUID, PK)
  - order_number (VARCHAR, unique)
  - user_id (UUID, FK, nullable) -- null for walk-in
  - address_id (UUID, FK, nullable)
  - address_snapshot (JSONB) -- store address at order time
  - subtotal (DECIMAL)
  - discount_amount (DECIMAL, default 0)
  - coupon_id (UUID, FK, nullable)
  - delivery_charge (DECIMAL)
  - tax_amount (DECIMAL) -- GST 18%
  - total_amount (DECIMAL)
  - payment_method (VARCHAR) -- 'cod', 'online'
  - payment_status (VARCHAR) -- 'pending', 'paid', 'failed'
  - order_status (VARCHAR) -- 'placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'
  - source (VARCHAR) -- 'online', 'offline'
  - pos_user_id (UUID, FK, nullable) -- admin who made offline sale
  - notes (TEXT, nullable)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
  ```

#### Order Items Table
- [ ] Order_Items table:
  ```sql
  - id (UUID, PK)
  - order_id (UUID, FK)
  - product_id (UUID, FK)
  - variant_id (UUID, FK, nullable)
  - product_snapshot (JSONB) -- store product details at order time
  - variant_snapshot (JSONB, nullable)
  - quantity (INT)
  - unit_price (DECIMAL)
  - subtotal (DECIMAL)
  - created_at (TIMESTAMP)
  ```

#### Order Status History Table
- [ ] Order_Status_History table:
  ```sql
  - id (UUID, PK)
  - order_id (UUID, FK)
  - status (VARCHAR)
  - notes (TEXT, nullable)
  - created_by (UUID, FK, nullable) -- admin user
  - created_at (TIMESTAMP)
  ```

### Part B: Cart, Wishlist, Order APIs

#### Cart Endpoints
- [ ] GET /api/cart
  - [ ] Return user's cart items with product details

- [ ] POST /api/cart/add
  - [ ] Add item to cart
  - [ ] If exists, update quantity

- [ ] PUT /api/cart/update/:id
  - [ ] Update cart item quantity

- [ ] DELETE /api/cart/remove/:id
  - [ ] Remove item from cart

- [ ] DELETE /api/cart/clear
  - [ ] Clear entire cart

- [ ] POST /api/cart/sync
  - [ ] Sync local cart with server (on login)

#### Wishlist Endpoints
- [ ] GET /api/wishlist
  - [ ] Return user's wishlist

- [ ] POST /api/wishlist/add
  - [ ] Add product to wishlist

- [ ] DELETE /api/wishlist/remove/:id
  - [ ] Remove from wishlist

- [ ] DELETE /api/wishlist/clear
  - [ ] Clear wishlist

#### Address Endpoints
- [ ] GET /api/users/addresses
  - [ ] Return user's addresses

- [ ] POST /api/users/addresses
  - [ ] Add new address

- [ ] PUT /api/users/addresses/:id
  - [ ] Update address

- [ ] DELETE /api/users/addresses/:id
  - [ ] Delete address

- [ ] PUT /api/users/addresses/:id/default
  - [ ] Set as default address

#### Coupon Endpoints
- [ ] POST /api/coupons/validate
  - [ ] Validate coupon code
  - [ ] Check min order value
  - [ ] Check usage limits
  - [ ] Return discount details

#### Order Endpoints (User)
- [ ] POST /api/orders/create
  - [ ] Validate cart items
  - [ ] Validate address
  - [ ] Apply coupon (if any)
  - [ ] Calculate totals (subtotal, delivery, GST, total)
  - [ ] Create order
  - [ ] Create order items
  - [ ] Update stock
  - [ ] Clear cart
  - [ ] Create status history
  - [ ] Return order details

#### Admin Coupon Endpoints
- [ ] GET /api/admin/coupons
- [ ] POST /api/admin/coupons
- [ ] PUT /api/admin/coupons/:id
- [ ] DELETE /api/admin/coupons/:id

#### Seed Data
- [ ] Sample coupons

---

## PHASE 4: Orders & User Management

### Part A: Order Status & History

#### Order Status Flow
- [ ] Define status transitions:
  ```
  placed → confirmed → shipped → out_for_delivery → delivered
  placed → cancelled
  confirmed → cancelled
  ```
- [ ] Validate status transitions

#### Update Stock on Order
- [ ] Decrease stock on order creation
- [ ] Increase stock on cancellation

### Part B: Order & User APIs

#### Order Endpoints (User)
- [ ] GET /api/orders
  - [ ] Return user's orders with filters
  - [ ] Include order items summary

- [ ] GET /api/orders/:id
  - [ ] Return order details with items

- [ ] POST /api/orders/:id/cancel
  - [ ] Validate order can be cancelled
  - [ ] Update status
  - [ ] Restore stock
  - [ ] Return updated order

#### Profile Endpoints
- [ ] GET /api/users/profile
  - [ ] Return user profile

- [ ] PUT /api/users/profile
  - [ ] Update profile (name, mobile, profile_image)

- [ ] POST /api/users/upload-avatar
  - [ ] Upload profile image to Supabase Storage

- [ ] POST /api/users/change-password
  - [ ] Validate current password
  - [ ] Update password

#### Admin Order Endpoints
- [ ] GET /api/admin/orders
  - [ ] Return all orders with filters
  - [ ] Include customer info

- [ ] GET /api/admin/orders/:id
  - [ ] Return order details

- [ ] PUT /api/admin/orders/:id/status
  - [ ] Update order status
  - [ ] Create status history record
  - [ ] Validate status transition

#### Admin User Endpoints
- [ ] GET /api/admin/users
  - [ ] Return all users with filters

- [ ] GET /api/admin/users/:id
  - [ ] Return user details with order history

- [ ] PUT /api/admin/users/:id/block
  - [ ] Block/unblock user

---

## PHASE 5: Reviews, Reports & POS

### Part A: Database Models

#### Reviews Table
- [ ] Reviews table:
  ```sql
  - id (UUID, PK)
  - product_id (UUID, FK)
  - user_id (UUID, FK)
  - order_id (UUID, FK) -- verified purchase
  - rating (INT) -- 1-5
  - title (VARCHAR, nullable)
  - review_text (TEXT)
  - status (VARCHAR) -- 'pending', 'approved', 'rejected'
  - helpful_count (INT, default 0)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
  ```

#### Review Images Table
- [ ] Review_Images table:
  ```sql
  - id (UUID, PK)
  - review_id (UUID, FK)
  - image_url (VARCHAR)
  - created_at (TIMESTAMP)
  ```

### Part B: Review, Report & POS APIs

#### Review Endpoints (User)
- [ ] GET /api/products/:id/reviews
  - [ ] Return approved reviews
  - [ ] Pagination

- [ ] POST /api/reviews/add
  - [ ] Validate user purchased product
  - [ ] Create review
  - [ ] Upload images (if any)

- [ ] PUT /api/reviews/:id
  - [ ] Update own review

- [ ] DELETE /api/reviews/:id
  - [ ] Delete own review

- [ ] POST /api/reviews/:id/images
  - [ ] Upload review images

#### Admin Review Endpoints
- [ ] GET /api/admin/reviews
  - [ ] Return all reviews with filters

- [ ] PUT /api/admin/reviews/:id/approve
  - [ ] Approve review
  - [ ] Update product average rating

- [ ] PUT /api/admin/reviews/:id/reject
  - [ ] Reject review

- [ ] DELETE /api/admin/reviews/:id
  - [ ] Delete review

#### Admin Analytics Endpoints
- [ ] GET /api/admin/analytics/dashboard
  - [ ] Return:
    - [ ] Total orders (today/week/month)
    - [ ] Total revenue (today/week/month)
    - [ ] Total users
    - [ ] Total products
    - [ ] Low stock count
    - [ ] Pending orders count

- [ ] GET /api/admin/analytics/sales
  - [ ] Query params: start_date, end_date, group_by (day/week/month)
  - [ ] Return:
    - [ ] Revenue by period
    - [ ] Order count by period
    - [ ] Sales by category
    - [ ] Top products

#### Admin Inventory Endpoints
- [ ] GET /api/admin/inventory
  - [ ] Return stock levels with filters
  - [ ] Include low stock items

- [ ] PUT /api/admin/inventory/update
  - [ ] Update stock for product/variant
  - [ ] Record reason

- [ ] GET /api/admin/inventory/history
  - [ ] Return stock change history

#### POS Endpoints
- [ ] GET /api/admin/pos/products
  - [ ] Quick search for POS

- [ ] GET /api/admin/pos/customers
  - [ ] Search customers by phone

- [ ] POST /api/admin/pos/customers
  - [ ] Quick create customer

- [ ] POST /api/admin/orders/offline
  - [ ] Create offline (POS) order
  - [ ] Set source = 'offline'
  - [ ] Set pos_user_id
  - [ ] Update stock
  - [ ] Return order with receipt data

---

## PHASE 6: Payment, Email & Invoice

### Part A: Integration Setup

#### Razorpay Setup
- [ ] Install razorpay package
- [ ] Configure API keys
- [ ] Create Razorpay client

#### Zepto Mail Setup
- [ ] Configure Zepto Mail API
- [ ] Create email templates:
  - [ ] Order confirmation
  - [ ] Order status update
  - [ ] Password reset

#### Invoice Generation
- [ ] Install ReportLab or similar
- [ ] Create invoice PDF template
- [ ] Include: logo, order details, items, totals, GST

### Part B: Payment, Email & Invoice APIs

#### Payment Endpoints
- [ ] POST /api/payments/create-order
  - [ ] Create Razorpay order
  - [ ] Store order_id
  - [ ] Return Razorpay order details

- [ ] POST /api/payments/verify
  - [ ] Verify Razorpay signature
  - [ ] Update order payment status
  - [ ] Send confirmation email

- [ ] POST /api/payments/webhook
  - [ ] Handle Razorpay webhooks
  - [ ] Update payment status

- [ ] POST /api/payments/cod
  - [ ] Create COD order
  - [ ] Send confirmation email

#### Email Notifications
- [ ] Send order confirmation email
- [ ] Send order status update email
- [ ] Send password reset email

#### Invoice Endpoints
- [ ] GET /api/orders/:id/invoice
  - [ ] Generate invoice PDF
  - [ ] Return PDF file

#### Admin Banner Endpoints
- [ ] GET /api/admin/banners
- [ ] POST /api/admin/banners
- [ ] PUT /api/admin/banners/:id
- [ ] DELETE /api/admin/banners/:id
- [ ] PUT /api/admin/banners/reorder

#### Public Banner Endpoint
- [ ] GET /api/banners
  - [ ] Return active banners

---

## Configuration Constants

### Tax
- [ ] GST_RATE = 0.18 (18%)

### Shipping
- [ ] FIXED_DELIVERY_CHARGE = 50 (or configurable)
- [ ] FREE_DELIVERY_THRESHOLD = 500 (optional)

### Order Status
- [ ] STATUS_PLACED = 'placed'
- [ ] STATUS_CONFIRMED = 'confirmed'
- [ ] STATUS_SHIPPED = 'shipped'
- [ ] STATUS_OUT_FOR_DELIVERY = 'out_for_delivery'
- [ ] STATUS_DELIVERED = 'delivered'
- [ ] STATUS_CANCELLED = 'cancelled'

---

## Verification Checklist

### After Each Phase
- [ ] All endpoints respond correctly
- [ ] Input validation works
- [ ] Error handling is consistent
- [ ] Auth protection works
- [ ] Database operations are atomic

### Final Testing
- [ ] Test all endpoints with Postman
- [ ] Test error scenarios
- [ ] Test auth flow
- [ ] Test payment flow
- [ ] Test email sending
- [ ] Load testing (basic)

---

## Progress Tracking

| Phase | Part A | Part B | Status |
|-------|--------|--------|--------|
| 1 | [ ] | [ ] | Not Started |
| 2 | [ ] | [ ] | Not Started |
| 3 | [ ] | [ ] | Not Started |
| 4 | [ ] | [ ] | Not Started |
| 5 | [ ] | [ ] | Not Started |
| 6 | [ ] | [ ] | Not Started |
