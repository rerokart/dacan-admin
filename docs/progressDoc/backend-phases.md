# Backend Development Phases
## Flask API - Rerokart E-Commerce

**Tech Stack:** Flask + Supabase (PostgreSQL) + JWT Auth + Razorpay + Zepto Mail

---

## PHASE 1: Foundation & Authentication

### Part A: Project Setup

#### Flask Project Structure
- [x] Create Flask project
- [x] Setup virtual environment
- [x] Install dependencies:
  - [x] Flask
  - [x] Flask-CORS
  - [x] Flask-JWT-Extended
  - [x] Supabase Python client
  - [x] python-dotenv
  - [x] Werkzeug (password hashing)
- [x] Create folder structure:
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
- [x] Create Supabase project
- [x] Configure connection in .env
- [x] Create Supabase client wrapper
- [x] Test database connection

#### Database Models - Users
- [x] Users table:
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
- [x] Admins table:
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
- [x] Configure JWT secret key
- [x] Setup access token (1 year expiry - no refresh needed)
- [x] Create auth decorators:
  - [x] @jwt_required
  - [x] @admin_required

### Part B: Auth APIs

#### User Auth Endpoints
- [x] POST /api/auth/register
  - [x] Validate input (email, mobile, password)
  - [x] Check email/mobile uniqueness
  - [x] Hash password
  - [x] Create user
  - [x] Return user data + tokens

- [x] POST /api/auth/login
  - [x] Validate credentials
  - [x] Check user is active
  - [x] Generate tokens
  - [x] Return user data + tokens

- [x] POST /api/auth/logout
  - [x] Invalidate token (optional: blacklist)
  - [x] Return success

- [x] POST /api/auth/forgot-password
  - [x] Validate email exists
  - [x] Generate reset token (6 digit OTP or link)
  - [x] Store reset token with expiry
  - [x] Return success (email will be sent in Phase 6)

- [x] POST /api/auth/reset-password
  - [x] Validate reset token
  - [x] Update password
  - [x] Clear reset token
  - [x] Return success

- [x] GET /api/auth/me
  - [x] Return current user data

#### Admin Auth Endpoints
- [x] POST /api/admin/auth/login
  - [x] Validate admin credentials
  - [x] Generate admin tokens
  - [x] Return admin data + tokens

#### Seed Data
- [x] Create seed script for test admin user

---

## PHASE 2: Products & Categories

### Part A: Database Models

#### Categories Table
- [x] Categories table:
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
- [x] Products table:
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
- [x] Product_Variants table:
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
- [x] Product_Images table:
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
- [x] GET /api/categories
  - [x] Return all active categories
  - [x] Include product count
  - [x] Tree structure (parent-child)

- [x] GET /api/categories/:id
  - [x] Return category details

- [x] GET /api/categories/:id/products
  - [x] Return products in category
  - [x] Support pagination

#### Public Product Endpoints
- [x] GET /api/products
  - [x] Query params:
    - [x] category_id
    - [x] search
    - [x] min_price, max_price
    - [x] min_rating
    - [x] in_stock (boolean)
    - [x] sort (price_asc, price_desc, newest, rating)
    - [x] page, limit
  - [x] Return products with pagination
  - [x] Include primary image, category name

- [x] GET /api/products/:id
  - [x] Return product with:
    - [x] All images
    - [x] All variants (if has_variants)
    - [x] Category info

- [x] GET /api/products/:id/variants
  - [x] Return product variants

- [x] GET /api/products/search
  - [x] Search by name, SKU
  - [x] Return matching products

- [x] GET /api/products/featured
  - [x] Return featured/promoted products

- [x] GET /api/products/latest
  - [x] Return newest products

#### Admin Product Endpoints
- [x] POST /api/admin/products
  - [x] Create product with variants and images
  - [x] Validate required fields
  - [x] Generate SKU if not provided

- [x] PUT /api/admin/products/:id
  - [x] Update product details

- [x] DELETE /api/admin/products/:id
  - [x] Soft delete or hard delete

- [x] POST /api/admin/products/:id/images
  - [x] Upload product images to Supabase Storage
  - [x] Return image URLs

- [x] DELETE /api/admin/products/:id/images/:imageId
  - [x] Delete product image

- [x] POST /api/admin/products/:id/variants
  - [x] Add variant to product

- [x] PUT /api/admin/products/:id/variants/:variantId
  - [x] Update variant

- [x] DELETE /api/admin/products/:id/variants/:variantId
  - [x] Delete variant

#### Admin Category Endpoints
- [x] POST /api/admin/categories
  - [x] Create category

- [x] PUT /api/admin/categories/:id
  - [x] Update category

- [x] DELETE /api/admin/categories/:id
  - [x] Delete category (check no products)

#### Seed Data
- [x] Create seed script for:
  - [x] Sample categories
  - [x] Sample products with variants

---

## PHASE 3: Cart, Wishlist & Orders

### Part A: Database Models

#### Cart Items Table
- [x] Cart_Items table:
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
- [x] Wishlist table:
  ```sql
  - id (UUID, PK)
  - user_id (UUID, FK)
  - product_id (UUID, FK)
  - created_at (TIMESTAMP)
  ```

#### Addresses Table
- [x] Addresses table:
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
- [x] Coupons table:
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
- [x] Orders table:
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
- [x] Order_Items table:
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
- [x] Order_Status_History table:
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
- [x] GET /api/cart
  - [x] Return user's cart items with product details

- [x] POST /api/cart/add
  - [x] Add item to cart
  - [x] If exists, update quantity

- [x] PUT /api/cart/update/:id
  - [x] Update cart item quantity

- [x] DELETE /api/cart/remove/:id
  - [x] Remove item from cart

- [x] DELETE /api/cart/clear
  - [x] Clear entire cart

- [x] POST /api/cart/sync
  - [x] Sync local cart with server (on login)

#### Wishlist Endpoints
- [x] GET /api/wishlist
  - [x] Return user's wishlist

- [x] POST /api/wishlist/add
  - [x] Add product to wishlist

- [x] DELETE /api/wishlist/remove/:id
  - [x] Remove from wishlist

- [x] DELETE /api/wishlist/clear
  - [x] Clear wishlist

#### Address Endpoints
- [x] GET /api/users/addresses
  - [x] Return user's addresses

- [x] POST /api/users/addresses
  - [x] Add new address

- [x] PUT /api/users/addresses/:id
  - [x] Update address

- [x] DELETE /api/users/addresses/:id
  - [x] Delete address

- [x] PUT /api/users/addresses/:id/default
  - [x] Set as default address

#### Coupon Endpoints
- [x] POST /api/coupons/validate
  - [x] Validate coupon code
  - [x] Check min order value
  - [x] Check usage limits
  - [x] Return discount details

#### Order Endpoints (User)
- [x] POST /api/orders/create
  - [x] Validate cart items
  - [x] Validate address
  - [x] Apply coupon (if any)
  - [x] Calculate totals (subtotal, delivery, GST, total)
  - [x] Create order
  - [x] Create order items
  - [x] Update stock
  - [x] Clear cart
  - [x] Create status history
  - [x] Return order details

#### Admin Coupon Endpoints
- [x] GET /api/admin/coupons
- [x] POST /api/admin/coupons
- [x] PUT /api/admin/coupons/:id
- [x] DELETE /api/admin/coupons/:id

#### Seed Data
- [x] Sample coupons

---

## PHASE 4: Orders & User Management

### Part A: Order Status & History

#### Order Status Flow
- [x] Define status transitions:
  ```
  placed → confirmed → shipped → out_for_delivery → delivered
  placed → cancelled
  confirmed → cancelled
  ```
- [x] Validate status transitions

#### Update Stock on Order
- [x] Decrease stock on order creation
- [x] Increase stock on cancellation

### Part B: Order & User APIs

#### Order Endpoints (User)
- [x] GET /api/orders
  - [x] Return user's orders with filters
  - [x] Include order items summary

- [x] GET /api/orders/:id
  - [x] Return order details with items

- [x] POST /api/orders/:id/cancel
  - [x] Validate order can be cancelled
  - [x] Update status
  - [x] Restore stock
  - [x] Return updated order

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
- [x] GET /api/admin/orders
  - [x] Return all orders with filters
  - [x] Include customer info

- [x] GET /api/admin/orders/:id
  - [x] Return order details

- [x] PUT /api/admin/orders/:id/status
  - [x] Update order status
  - [x] Create status history record
  - [x] Validate status transition

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
- [x] GST_RATE = 0.18 (18%)

### Shipping
- [x] FIXED_DELIVERY_CHARGE = 50 (or configurable)
- [x] FREE_DELIVERY_THRESHOLD = 500 (optional)

### Order Status
- [x] STATUS_PLACED = 'placed'
- [x] STATUS_CONFIRMED = 'confirmed'
- [x] STATUS_SHIPPED = 'shipped'
- [x] STATUS_OUT_FOR_DELIVERY = 'out_for_delivery'
- [x] STATUS_DELIVERED = 'delivered'
- [x] STATUS_CANCELLED = 'cancelled'

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
| 1 | [x] | [x] | Completed |
| 2 | [x] | [x] | Completed |
| 3 | [x] | [x] | Completed |
| 4 | [x] | [~] | 60% (Orders done, Profile & User Management pending) |
| 5 | [ ] | [ ] | Not Started |
| 6 | [ ] | [ ] | Not Started |

**Legend:** [x] = Complete, [~] = Partial, [ ] = Not Started
