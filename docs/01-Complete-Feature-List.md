# Complete Feature List
# Decan India E-Commerce Platform

**Version:** 3.0  
**Architecture:** Flask Backend + React Native Mobile App + Next.js Admin Dashboard  
**Date:** January 10, 2026

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   MOBILE APP                         │
│            (React Native Expo)                       │
│         iOS & Android - Customer Facing              │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ REST API
                  │
┌─────────────────▼───────────────────────────────────┐
│                FLASK BACKEND                         │
│          Python REST API + WebSockets                │
│    (Auth, Products, Orders, Payments, etc.)         │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ Direct Connection
                  │
┌─────────────────▼───────────────────────────────────┐
│              SUPABASE DATABASE                       │
│         PostgreSQL + Storage + Auth                  │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ REST API
                  │
┌─────────────────▼───────────────────────────────────┐
│            ADMIN DASHBOARD                           │
│              (Next.js Web App)                       │
│   Admin Management + In-Store Sales + Analytics      │
└─────────────────────────────────────────────────────┘
```

---

## Table of Contents

1. [Mobile App Features (Customer)](#mobile-app-features)
2. [Admin Dashboard Features (Web)](#admin-dashboard-features)
3. [Backend API Features](#backend-api-features)
4. [Database Schema](#database-schema)
5. [Third-Party Integrations](#third-party-integrations)

---

## 1. Mobile App Features (Customer)

### 1.1 Authentication & Authorization

#### **Auth**
- **Login**
  - Email + Password
  - OTP-based login (SMS)
  - Remember me option
  - Biometric login (fingerprint/face ID)
  - Session management
  
- **Register**
  - Full name
  - Email
  - Mobile number (10 digits)
  - Password (with strength indicator)
  - Terms & conditions acceptance
  - Email verification (optional)
  - OTP verification (mobile)
  
- **Forgot Password**
  - Email-based reset link
  - OTP-based reset (SMS)
  - Password reset form
  - Password confirmation
  
- **Social Login** (Phase 2)
  - Google Sign-In
  - Facebook Login
  - Apple Sign-In (iOS)

- **Logout**
  - Clear session
  - Clear local cache
  - Biometric re-authentication option

### 1.2 User Profile & Account

#### **Profile**
- **View Profile**
  - Full name
  - Email
  - Mobile number
  - Profile picture (upload/change)
  - Member since date
  - Total orders count
  
- **Edit Profile**
  - Update name
  - Update mobile number
  - Update profile picture
  - Email change (with verification)
  
- **Change Password**
  - Current password verification
  - New password
  - Password strength indicator
  - Confirmation
  
- **Account Settings**
  - Notification preferences (push/email/SMS)
  - Language selection
  - Currency preference
  - Dark mode toggle
  - App version info

#### **Addresses**
- **List Addresses**
  - View all saved addresses
  - Default address indicator
  - Address labels (Home, Work, etc.)
  
- **Add Address**
  - Address line 1 & 2
  - City, State, Pincode
  - Phone number
  - Address type (Home/Work/Other)
  - Set as default option
  - Location picker (map integration)
  
- **Edit Address**
  - Modify existing address
  - Update default status
  
- **Delete Address**
  - Confirmation dialog
  - Cannot delete if used in pending orders

### 1.3 Product Browsing & Discovery

#### **Home Screen**
- **Banner Slider**
  - Promotional banners (auto-scroll)
  - Click-through to products/categories
  - Dots indicator
  - Manual swipe
  
- **Category Grid**
  - Category cards with images
  - Category names
  - Product count per category
  
- **Featured Sections**
  - Latest products (8 items)
  - Best sellers (8 items)
  - Deal of the day
  - Recommended for you (based on browsing)
  
- **Quick Actions**
  - Search bar (sticky)
  - Cart icon with badge
  - Notification bell
  - Profile icon

#### **Product Listing**
- **View Options**
  - Grid view (2 columns)
  - List view (1 column)
  - Toggle between views
  
- **Product Card**
  - Product image (with lazy loading)
  - Product name (2 lines max)
  - Price (discounted if applicable)
  - Original price (strikethrough)
  - Discount percentage badge
  - Rating stars + count
  - Wishlist heart icon
  - Quick add to cart button
  - Stock status badge
  
- **Filters**
  - By category (multi-select)
  - By price range (slider)
  - By rating (4+ stars, 3+ stars, etc.)
  - By availability (in stock only)
  - By discount (50% off, 30% off, etc.)
  - Apply/Clear filters
  
- **Sort Options**
  - Relevance (default)
  - Price: Low to High
  - Price: High to Low
  - Newest First
  - Popularity
  - Rating: High to Low
  - Discount: High to Low
  
- **Pagination**
  - Infinite scroll
  - "Load more" button
  - Loading skeleton

#### **Search**
- **Search Bar**
  - Voice search option
  - Search history (recent searches)
  - Clear search history
  - Search suggestions (as you type)
  - Trending searches
  
- **Search Results**
  - Product matches
  - Category matches
  - Did you mean? (spelling correction)
  - No results state with suggestions
  - Filter & sort on results

#### **Product Details**
- **Product Information**
  - Image gallery (swipe/zoom)
  - Product name
  - SKU number
  - Brand (if applicable)
  - Rating & review count
  - Price information:
    - Current price
    - Original price
    - Discount percentage
    - You save: ₹X
  - Stock availability:
    - In stock (quantity if low)
    - Out of stock
    - Coming soon
  - **Size/Variant Selection** ⭐ NEW
    - Size dropdown (Small, Medium, Large, XL, etc.)
    - Price per size
    - Stock per size
    - Selected size indicator
  
- **Product Description**
  - Short description (above fold)
  - Full description (expandable)
  - Key features (bullet points)
  - Specifications table
  - Additional details
  
- **Actions**
  - Add to cart (with size selection)
  - Add to wishlist
  - Share product
  - Size guide (if applicable)
  
- **Reviews & Ratings**
  - Overall rating (stars)
  - Rating distribution (5★ to 1★ bars)
  - Total review count
  - Sort reviews (Most recent, Highest, Lowest)
  - Filter reviews (With images, Verified purchase)
  - Individual reviews:
    - User name (anonymized)
    - Rating stars
    - Review text
    - Review images (gallery)
    - Helpful count
    - Report review option
    - Date
  - Write a review button
  
- **Related Products**
  - Similar products carousel
  - Customers also bought
  - You may also like

#### **Categories**
- **Category List**
  - All categories
  - Category images
  - Subcategories (if any)
  - Product count
  
- **Category View**
  - Category name & description
  - Breadcrumb navigation
  - Filter by subcategory
  - All product listing features

### 1.4 Shopping Cart & Wishlist

#### **Shopping Cart**
- **Cart Items**
  - Product image (thumbnail)
  - Product name
  - Selected size/variant
  - Price per unit
  - Quantity selector (+/-)
  - Subtotal per item
  - Remove button
  - Move to wishlist
  - Stock availability check
  
- **Cart Summary**
  - Items total (₹)
  - Discount (if coupon applied)
  - Delivery charge
  - Tax/GST (18%)
  - Grand total (large, bold)
  
- **Coupon Section**
  - "Apply Coupon" button
  - Enter coupon code
  - Available coupons list
  - Applied coupon display
  - Remove coupon option
  
- **Actions**
  - Continue shopping
  - Proceed to checkout
  - Clear cart (confirmation)
  
- **Empty Cart State**
  - Empty illustration
  - Message
  - Browse products button

#### **Wishlist**
- **Wishlist Items**
  - Product image
  - Product name
  - Price
  - Stock status
  - Add to cart button
  - Remove from wishlist
  
- **Actions**
  - Add all to cart
  - Share wishlist
  - Clear wishlist
  
- **Empty Wishlist State**
  - Empty illustration
  - Browse products button

### 1.5 Checkout & Orders

#### **Checkout Flow**
- **Step 1: Address Selection**
  - List saved addresses (radio select)
  - Add new address button
  - Edit selected address
  - Delivery location map
  
- **Step 2: Order Summary**
  - Review cart items
  - Selected address
  - Edit cart link
  - Change address link
  - Apply coupon (if not done)
  
- **Step 3: Payment Method**
  - Cash on Delivery (COD)
    - COD charges (if any)
    - Pay on delivery message
  - Online Payment (Razorpay)
    - Credit/Debit card
    - Net banking
    - UPI
    - Wallets (Paytm, PhonePe, etc.)
    - Payment icons
  - Saved cards (if any)
  
- **Step 4: Review & Place Order**
  - Final order summary
  - Delivery address
  - Payment method
  - Price breakdown
  - Terms acceptance checkbox
  - Place order button
  - Processing loader

#### **Order Confirmation**
- **Success Screen**
  - Success animation
  - Order number
  - Estimated delivery date
  - Order summary
  - View order details button
  - Continue shopping button
  
- **Notifications**
  - Email confirmation
  - SMS confirmation
  - Push notification

#### **Orders**
- **Order History**
  - List all orders (newest first)
  - Order card:
    - Order number
    - Order date
    - Status badge
    - Total amount
    - Item count & thumbnails
    - View details button
  
- **Order Filters**
  - All orders
  - Delivered
  - In transit
  - Cancelled
  - Returned
  
- **Order Details**
  - Order number (large)
  - Order status timeline:
    - Order placed ✓
    - Order confirmed ✓
    - Shipped (in progress)
    - Out for delivery
    - Delivered
  - Estimated delivery date
  - Order items:
    - Product image
    - Product name
    - Size/variant
    - Quantity
    - Price
  - Delivery address
  - Payment method
  - Price breakdown
  - Order date & time
  
- **Order Actions**
  - Track order (map view)
  - Download invoice (PDF)
  - Cancel order (if not shipped)
  - Return/Replace (if delivered)
  - Reorder (add to cart)
  - Need help button
  
- **Cancel Order**
  - Cancellation reasons (dropdown)
  - Confirmation dialog
  - Refund information
  
- **Track Order**
  - Live tracking map
  - Current status
  - Delivery partner details
  - Contact delivery person
  - Delivery person location (real-time)

#### **Reviews After Delivery**
- **Write Review**
  - Rate product (1-5 stars)
  - Review title
  - Review text (500 chars max)
  - Upload images (max 3)
  - Submit button
  
- **Edit Review**
  - Modify existing review
  - Update rating
  - Update images

### 1.6 Notifications

#### **Push Notifications**
- Order placed confirmation
- Order status updates
- Delivery updates
- Out for delivery
- Delivered
- Price drops on wishlist items
- Back in stock alerts
- Promotional offers
- Cart abandonment reminders

#### **In-App Notifications**
- Notification list
- Mark as read
- Delete notification
- Notification badge count
- Deep links to relevant screens

### 1.7 Static & Help Pages

#### **Help & Support**
- **FAQ**
  - Searchable FAQ
  - Categorized questions
  - Expandable answers
  
- **Contact Us**
  - Contact form
  - Email link
  - Phone link (click to call)
  - WhatsApp chat (Phase 2)
  - Working hours
  
- **Ticket System** (Phase 2)
  - Raise a ticket
  - View tickets
  - Ticket status
  - Chat with support

#### **About**
- Company information
- Mission & vision
- Contact details

#### **Policies**
- Privacy Policy (scrollable)
- Terms & Conditions
- Shipping Policy
- Return & Refund Policy
- Cancellation Policy

#### **App Settings**
- App version
- Check for updates
- Clear cache
- Rate app (store link)
- Share app
- Legal information

### 1.8 Additional Features

#### **Offline Mode**
- Cache product data
- Browse cached products
- Sync when online
- Offline indicator

#### **Deep Linking**
- Product links
- Category links
- Order tracking links
- Promotional links

#### **App Performance**
- Image lazy loading
- Infinite scroll
- Pull to refresh
- Optimistic updates
- Smooth animations

---

## 2. Admin Dashboard Features (Web)

### 2.1 Admin Authentication

#### **Admin Login**
- Email + Password
- Two-factor authentication (2FA)
- Admin role verification
- Session timeout (30 minutes)
- Remember device option

#### **Admin Users**
- List all admin users
- Add new admin
- Edit admin permissions
- Deactivate admin
- Admin activity log

### 2.2 Dashboard & Analytics

#### **Dashboard Home**
- **Statistics Cards**
  - Total orders (today, this week, this month)
  - Total revenue (with growth %)
  - Total users (active/inactive)
  - Total products (active/low stock)
  - Avg order value
  - Conversion rate
  
- **Charts & Graphs**
  - Sales trend (line chart)
  - Revenue by category (pie chart)
  - Orders by status (bar chart)
  - Top selling products (table)
  - Traffic sources (donut chart)
  
- **Recent Activity**
  - Recent orders (last 10)
  - Recent users (last 10)
  - Low stock alerts
  - Pending reviews
  - Critical notifications
  
- **Quick Actions**
  - Add product
  - View orders
  - Process refunds
  - Bulk update stock

### 2.3 Product Management

#### **Product List**
- **View Options**
  - Table view (default)
  - Grid view
  - Compact view
  
- **Table Columns**
  - Thumbnail image
  - SKU
  - Product name
  - Category
  - Price
  - Stock (all variants combined)
  - Status (active/inactive)
  - Created date
  - Actions (edit/delete/duplicate)
  
- **Filters**
  - By category
  - By status
  - By stock (in stock, low stock, out of stock)
  - By price range
  - By date added
  
- **Search**
  - Search by name
  - Search by SKU
  - Advanced search
  
- **Bulk Actions**
  - Bulk activate/deactivate
  - Bulk delete
  - Bulk export (CSV)
  - Bulk price update
  - Bulk stock update

#### **Add Product**
- **Basic Information**
  - Product name
  - SKU (auto-generated or manual)
  - Slug (auto from name)
  - Category (dropdown with search)
  - Brand (optional)
  - Status (active/inactive toggle)
  
- **Pricing** (Base pricing for default variant)
  - Base price
  - Original price (for discount display)
  - Discount percentage (auto-calculated)
  - Tax category (GST 18%)
  
- **Product Variants** ⭐ NEW FEATURE
  - **Variant Type**: Size, Color, Material, etc.
  - **Add Variants**:
    - Variant name (e.g., Small, Medium, Large)
    - Variant SKU (auto: PROD-SKU-SM)
    - Price for this variant
    - Original price for this variant
    - Stock quantity for this variant
    - Weight/dimensions (optional)
  - **Variant Table View**:
    | Variant | SKU | Price | Stock | Status | Actions |
    |---------|-----|-------|-------|--------|---------|
    | Small   | DH-001-SM | ₹299 | 50 | Active | Edit/Delete |
    | Medium  | DH-001-MD | ₹349 | 30 | Active | Edit/Delete |
    | Large   | DH-001-LG | ₹399 | 20 | Active | Edit/Delete |
  - **Bulk Variant Creation**
    - Template upload (CSV)
    - Mass add sizes with pricing
  
- **Inventory** (If no variants, single stock)
  - Total stock quantity
  - Low stock threshold (alert at X items)
  - Stock tracking (enable/disable)
  - Backorder allowed (yes/no)
  
- **Description**
  - Short description (500 chars)
  - Full description (rich text editor)
  - Key features (bullet points)
  - Specifications (key-value pairs)
  
- **Images**
  - Upload multiple images (drag & drop)
  - Set primary image
  - Reorder images (drag & drop)
  - Delete image
  - Image optimization (auto)
  - Max 10 images per product
  - Image preview
  
- **SEO**
  - Meta title
  - Meta description
  - Keywords
  
- **Actions**
  - Save as draft
  - Publish
  - Save and add another
  - Preview

#### **Edit Product**
- Same form as add
- Update existing data
- Version history (optional)
- Last modified info

#### **Bulk Upload Products**
- Download CSV template
- Upload CSV file
- Map columns
- Validate data
- Preview import
- Import products
- Error log (if any)

#### **Product Categories**
- **List Categories**
  - Tree view (parent-child)
  - Category name
  - Product count
  - Status
  - Actions
  
- **Add Category**
  - Category name
  - Slug
  - Description
  - Parent category (dropdown)
  - Category image
  - Display order
  - Status
  
- **Edit Category**
  - Same as add
  - Cannot delete if products exist
  
- **Delete Category**
  - Confirmation
  - Move products to other category

### 2.4 Order Management

#### **Order List**
- **Table View**
  - Order number
  - Customer name
  - Order date
  - Total amount
  - Payment method
  - Payment status
  - Order status
  - Source (online/offline) ⭐ NEW
  - Actions
  
- **Filters**
  - By status (all, placed, confirmed, shipped, delivered, cancelled)
  - By payment method
  - By payment status
  - By date range
  - By source (online/offline) ⭐ NEW
  - By amount range
  
- **Search**
  - By order number
  - By customer name
  - By customer phone
  - By customer email
  
- **Bulk Actions**
  - Bulk status update
  - Bulk export
  - Bulk invoice generation
  - Bulk delete

#### **Order Details**
- **Order Information**
  - Order number (large)
  - Order date & time
  - Order source (Online/Offline) ⭐ NEW
  - Payment method
  - Payment status
  - Payment transaction ID
  - Order status (editable)
  - Status timeline
  
- **Customer Information**
  - Customer name
  - Email
  - Phone
  - Total orders by this customer
  - Link to customer profile
  
- **Order Items**
  - Product image
  - Product name
  - SKU
  - Size/variant ⭐ NEW
  - Quantity
  - Price per unit
  - Subtotal
  
- **Delivery Address**
  - Full address
  - Phone
  - Edit address (if not shipped)
  
- **Price Breakdown**
  - Subtotal
  - Discount (coupon)
  - Delivery charge
  - Tax/GST
  - Grand total
  
- **Actions**
  - Update status
  - Add tracking info
  - Send notification
  - Print invoice
  - Print packing slip
  - Refund order
  - Cancel order
  - Add admin notes

#### **Update Order Status**
- Status dropdown:
  - Placed → Confirmed → Shipped → Delivered
  - Can mark as Cancelled
- Add tracking number
- Add carrier name
- Send notification to customer
- Admin notes (internal)

#### **Offline Store Sales** ⭐ NEW FEATURE

**POS-style Interface:**

- **Quick Sale Screen**
  - Product search bar (by name, SKU, or barcode scan)
  - Product quick select grid (frequent items)
  - Search results:
    - Product name
    - Available variants with stock
    - Price per variant
  - Selected items list:
    - Product name
    - Variant
    - Quantity selector
    - Price
    - Remove button
  
- **Customer Selection (Optional)**
  - Search existing customer (by phone)
  - Walk-in customer (no profile)
  - Create new customer quick form
  
- **Size/Variant Selection**
  - Quick variant selector
  - Stock availability indicator
  - Price display per variant
  
- **Payment**
  - Cash payment
  - Card payment
  - UPI payment
  - Total amount display
  - Cash received input
  - Change calculation
  
- **Complete Sale**
  - Generate receipt
  - Print receipt (optional)
  - SMS receipt (if customer phone provided)
  - Email receipt (if customer email provided)
  - Clear cart for next sale
  
- **Sale Record**
  - Order created in system as "offline"
  - Inventory automatically reduced
  - Sales reflected in analytics
  - Invoice generated
  
- **Barcode Scanner Integration**
  - USB barcode scanner support
  - Quick product lookup
  - Fast checkout

**Offline Sale Features:**
- Real-time stock checking
- Low stock warnings during sale
- Multiple payment methods
- Split payment (partial cash, partial card)
- Hold sale (save and complete later)
- Return/refund handling
- Daily sales report
- Shift management (open/close register)
- Cash drawer tracking

### 2.5 User Management

#### **User List**
- **Table View**
  - User ID
  - Name
  - Email
  - Phone
  - Total orders
  - Total spent
  - Last order date
  - Status (active/blocked)
  - Joined date
  - Actions
  
- **Filters**
  - By status
  - By join date
  - By order count
  - By total spent
  
- **Search**
  - By name
  - By email
  - By phone

#### **User Details**
- **User Information**
  - Profile picture
  - Name, email, phone
  - Member since
  - Total orders
  - Total amount spent
  - Average order value
  - Last login
  
- **Order History**
  - List of all orders
  - Order details link
  
- **Addresses**
  - List saved addresses
  - View address details
  
- **Reviews**
  - List all reviews by user
  - Review moderation
  
- **Actions**
  - Edit user
  - Block/Unblock user
  - Reset password
  - Send email
  - Delete user (with confirmation)

### 2.6 Reviews & Ratings Management

#### **Review List**
- **Table View**
  - Product name (with link)
  - User name
  - Rating (stars)
  - Review text (truncated)
  - Review images
  - Date
  - Status (approved/pending/rejected)
  - Actions
  
- **Filters**
  - By rating (1-5 stars)
  - By status
  - By product
  - By date
  
- **Actions**
  - Approve review
  - Reject review
  - Delete review
  - Reply to review (Phase 2)

#### **Review Moderation**
- View full review
- View review images
- View user details
- Approve/reject with reason
- Delete inappropriate reviews
- Flag for manual review

### 2.7 Coupon Management

#### **Coupon List**
- **Table View**
  - Coupon code
  - Description
  - Discount type (% or fixed)
  - Discount value
  - Min order value
  - Usage (used/limit)
  - Valid from/to
  - Status
  - Actions
  
- **Filters**
  - By status (active/inactive/expired)
  - By type
  - By date

#### **Add/Edit Coupon**
- **Coupon Details**
  - Coupon code (auto-generate or custom)
  - Description
  - Discount type (percentage/fixed)
  - Discount value
  - Max discount (for percentage)
  - Min order value
  - Usage limit (per coupon)
  - Usage limit per user
  - Valid from date
  - Valid to date
  - Status (active/inactive)
  
- **Advanced Options**
  - Applicable to specific products
  - Applicable to specific categories
  - Exclude products
  - First order only
  - User segment (new/returning)
  
- **Actions**
  - Save coupon
  - Duplicate coupon
  - Delete coupon

### 2.8 Inventory Management

#### **Stock Overview**
- **Stock Dashboard**
  - Total products
  - In stock count
  - Low stock count (< threshold)
  - Out of stock count
  - Total inventory value
  
- **Low Stock Alerts**
  - Product name
  - Current stock
  - Threshold
  - Action needed
  
- **Stock by Category**
  - Category-wise stock levels
  - Stock value by category

#### **Stock Management**
- **View Stock Levels**
  - Product name
  - SKU
  - **Variants with individual stock** ⭐ NEW
    - Variant name
    - Variant stock
    - Stock value
  - Total stock (all variants)
  - Stock value
  - Last updated
  
- **Update Stock**
  - Product selection
  - Variant selection ⭐ NEW
  - Current stock display
  - New stock quantity
  - Reason (restock, adjustment, return, etc.)
  - Notes
  
- **Bulk Stock Update**
  - CSV upload
  - Multiple products/variants at once
  - Stock adjustment log
  
- **Stock History**
  - Date & time
  - Product & variant
  - Previous stock
  - New stock
  - Change type (add/remove/adjust)
  - Admin user
  - Notes

#### **Stock Alerts**
- Configure low stock threshold per product/variant
- Email notifications
- Dashboard alerts
- Auto-reorder suggestions (Phase 2)

### 2.9 Reports & Analytics

#### **Sales Reports**
- **Summary Reports**
  - Daily sales
  - Weekly sales
  - Monthly sales
  - Custom date range
  
- **Detailed Reports**
  - Sales by product
  - Sales by category
  - Sales by source (online/offline) ⭐ NEW
  - Sales by payment method
  - Sales by region (if available)
  
- **Export Options**
  - Export as PDF
  - Export as Excel
  - Export as CSV
  - Email report

#### **Product Reports**
- Top selling products
- Low selling products
- Out of stock products
- Products with low ratings
- Most viewed products
- Most added to cart (not purchased)

#### **Customer Reports**
- New customers (date range)
- Repeat customers
- Customer lifetime value
- Inactive customers
- Customer by region

#### **Financial Reports**
- Revenue report
- Tax report (GST)
- Discount report (coupons used)
- Refund report
- Payment method breakdown
- Profit margin (if cost price tracked)

### 2.10 Settings & Configuration

#### **General Settings**
- **Store Information**
  - Store name
  - Store logo
  - Contact email
  - Contact phone
  - Store address
  - Business hours
  
- **Regional Settings**
  - Currency
  - Date format
  - Time zone
  - Weight unit
  - Dimension unit

#### **Tax Settings**
- GST percentage
- Tax included in price (yes/no)
- Tax by product category

#### **Shipping Settings**
- Flat rate shipping
- Free shipping threshold
- Shipping by weight
- Shipping by region
- Delivery charge

#### **Payment Settings**
- **Razorpay Configuration**
  - API Key
  - API Secret
  - Test mode toggle
  - Webhook URL
  
- **COD Settings**
  - Enable/disable COD
  - COD charge (if any)
  - COD limit (max order value)
  
- **Other Payment Methods** (Phase 2)
  - PayPal
  - Stripe
  - UPI

#### **Email Settings**
- **Email Provider (Zepto Mail)**
  - API Key
  - From email
  - From name
  
- **Email Templates**
  - Order confirmation
  - Order status update
  - Delivery confirmation
  - Welcome email
  - Password reset
  - Customize templates (HTML)

#### **SMS Settings**
- **SMS Provider (MSG91)**
  - API Key
  - Sender ID
  
- **SMS Templates**
  - Order confirmation
  - OTP verification
  - Order status update
  - Delivery notification

#### **Notification Settings**
- Push notification configuration
- Admin email notifications
- Low stock alerts
- New order alerts
- Customer inquiry alerts

#### **App Settings**
- App version info
- Maintenance mode
- Force update
- API rate limits

#### **Security Settings**
- Admin 2FA enable/disable
- Session timeout
- Failed login attempts
- IP whitelist (admin access)
- API key management

### 2.11 Content Management

#### **Banner Management**
- **List Banners**
  - Banner image
  - Title
  - Link
  - Display order
  - Status
  - Actions
  
- **Add/Edit Banner**
  - Upload image (mobile & tablet sizes)
  - Banner title
  - Description
  - Link (product/category/external)
  - Display order
  - Active from/to dates
  - Status

#### **Static Pages**
- About Us
- Contact Us
- Privacy Policy
- Terms & Conditions
- Shipping Policy
- Return Policy
- FAQ
- Rich text editor
- Preview
- Publish

#### **FAQ Management**
- Category of FAQ
- Question
- Answer (rich text)
- Display order
- Status

---

## 3. Backend API Features

### 3.1 Authentication Endpoints

```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - User login
POST   /api/auth/logout            - User logout
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
POST   /api/auth/verify-otp        - Verify OTP
POST   /api/auth/resend-otp        - Resend OTP
POST   /api/auth/refresh-token     - Refresh JWT token
GET    /api/auth/me                - Get current user
```

### 3.2 User Endpoints

```
GET    /api/users/profile          - Get user profile
PUT    /api/users/profile          - Update user profile
POST   /api/users/change-password  - Change password
POST   /api/users/upload-avatar    - Upload profile picture

GET    /api/users/addresses        - List addresses
POST   /api/users/addresses        - Add address
PUT    /api/users/addresses/:id    - Update address
DELETE /api/users/addresses/:id    - Delete address
```

### 3.3 Product Endpoints

```
GET    /api/products               - List products (with filters, sort, pagination)
GET    /api/products/:id           - Get product details
GET    /api/products/slug/:slug    - Get product by slug
GET    /api/products/:id/variants  - Get product variants
GET    /api/products/search        - Search products
GET    /api/products/featured      - Get featured products
GET    /api/products/latest        - Get latest products
GET    /api/products/bestsellers   - Get best sellers
```

### 3.4 Category Endpoints

```
GET    /api/categories             - List all categories
GET    /api/categories/:id         - Get category details
GET    /api/categories/:id/products - Get products in category
```

### 3.5 Cart Endpoints

```
GET    /api/cart                   - Get user cart
POST   /api/cart/add               - Add item to cart (with variant)
PUT    /api/cart/update/:id        - Update cart item quantity
DELETE /api/cart/remove/:id        - Remove cart item
DELETE /api/cart/clear              - Clear entire cart
POST   /api/cart/sync              - Sync local cart with server
```

### 3.6 Order Endpoints

```
POST   /api/orders/create          - Create new order
GET    /api/orders                 - List user orders
GET    /api/orders/:id             - Get order details
POST   /api/orders/:id/cancel      - Cancel order
POST   /api/orders/:id/return      - Request return

GET    /api/orders/:id/invoice     - Download invoice
GET    /api/orders/:id/track       - Get tracking info
```

### 3.7 Payment Endpoints

```
POST   /api/payments/create-order  - Create Razorpay order
POST   /api/payments/verify        - Verify Razorpay signature
POST   /api/payments/webhook       - Razorpay webhook
POST   /api/payments/cod           - Place COD order
```

### 3.8 Review Endpoints

```
GET    /api/products/:id/reviews   - Get product reviews
POST   /api/reviews/add            - Add review
PUT    /api/reviews/:id            - Update review
DELETE /api/reviews/:id            - Delete review
POST   /api/reviews/:id/images     - Upload review images
POST   /api/reviews/:id/helpful    - Mark review as helpful
```

### 3.9 Coupon Endpoints

```
POST   /api/coupons/validate       - Validate coupon code
POST   /api/coupons/apply          - Apply coupon to cart
```

### 3.10 Wishlist Endpoints

```
GET    /api/wishlist               - Get user wishlist
POST   /api/wishlist/add           - Add to wishlist
DELETE /api/wishlist/remove/:id    - Remove from wishlist
DELETE /api/wishlist/clear          - Clear wishlist
```

### 3.11 Admin Endpoints

#### Products
```
POST   /api/admin/products         - Create product
PUT    /api/admin/products/:id     - Update product
DELETE /api/admin/products/:id     - Delete product
POST   /api/admin/products/:id/variants - Add product variant
PUT    /api/admin/products/:id/variants/:variantId - Update variant
DELETE /api/admin/products/:id/variants/:variantId - Delete variant
POST   /api/admin/products/bulk-upload - Bulk upload products
```

#### Orders
```
GET    /api/admin/orders           - List all orders (with filters)
PUT    /api/admin/orders/:id/status - Update order status
POST   /api/admin/orders/offline   - Create offline order (POS)
POST   /api/admin/orders/:id/refund - Process refund
```

#### Users
```
GET    /api/admin/users            - List all users
GET    /api/admin/users/:id        - Get user details
PUT    /api/admin/users/:id/block  - Block/unblock user
DELETE /api/admin/users/:id        - Delete user
```

#### Analytics
```
GET    /api/admin/analytics/dashboard - Dashboard stats
GET    /api/admin/analytics/sales  - Sales reports
GET    /api/admin/analytics/products - Product reports
GET    /api/admin/analytics/customers - Customer reports
```

#### Inventory
```
GET    /api/admin/inventory        - Get inventory overview
PUT    /api/admin/inventory/update - Update stock
POST   /api/admin/inventory/bulk-update - Bulk stock update
GET    /api/admin/inventory/history - Stock change history
```

### 3.12 Notification Endpoints

```
POST   /api/notifications/register-device - Register device for push
GET    /api/notifications          - Get user notifications
PUT    /api/notifications/:id/read - Mark as read
POST   /api/notifications/send     - Send notification (admin)
```

### 3.13 Upload Endpoints

```
POST   /api/upload/image           - Upload single image
POST   /api/upload/images          - Upload multiple images
POST   /api/upload/document        - Upload document (invoice, etc.)
DELETE /api/upload/:id              - Delete uploaded file
```

---

## 4. Database Schema

### Core Tables (Same as before with additions):

**Products Table:**
```sql
- id (UUID)
- sku (VARCHAR, unique)
- name (VARCHAR)
- slug (VARCHAR, unique)
- description (TEXT)
- short_description (VARCHAR)
- category_id (UUID, FK)
- base_price (DECIMAL)          -- Base price if no variants
- original_price (DECIMAL)
- has_variants (BOOLEAN)        -- ⭐ NEW
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Product Variants Table** ⭐ NEW
```sql
- id (UUID)
- product_id (UUID, FK)
- variant_type (VARCHAR)        -- 'size', 'color', 'material'
- variant_name (VARCHAR)        -- 'Small', 'Medium', 'Large'
- sku (VARCHAR, unique)         -- PROD-001-SM
- price (DECIMAL)
- original_price (DECIMAL)
- stock_quantity (INT)
- weight (DECIMAL, nullable)
- dimensions (VARCHAR, nullable)
- is_active (BOOLEAN)
- display_order (INT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Orders Table:**
```sql
- Add: source (VARCHAR)         -- 'online' or 'offline' ⭐ NEW
- Add: pos_user_id (UUID, FK)   -- Admin who made offline sale ⭐ NEW
- Add: payment_mode_offline (VARCHAR) -- 'cash', 'card', 'upi' ⭐ NEW
```

**Cart Items Table:**
```sql
- Add: variant_id (UUID, FK, nullable) ⭐ NEW
```

**Order Items Table:**
```sql
- Add: variant_id (UUID, FK, nullable) ⭐ NEW
- Add: variant_name (VARCHAR, nullable) ⭐ NEW
```

---

## 5. Third-Party Integrations

### Payment
- Razorpay (Online payments)
- COD (Cash on delivery)

### Communication
- Zepto Mail (Transactional emails)
- MSG91 (SMS notifications)
- Firebase Cloud Messaging (Push notifications)

### Storage
- Supabase Storage (Product images, documents)

### Maps & Location
- Google Maps API (Address selection, delivery tracking)

### Analytics
- Google Analytics (App analytics)
- Firebase Analytics (User behavior)

---

## Summary

### Total Features Count:

**Mobile App:** 150+ features  
**Admin Dashboard:** 120+ features  
**Backend APIs:** 50+ endpoints  
**Database Tables:** 15+ tables  

### New Features Added:

1. ✅ **Product Variants (Size/Color/etc.)**
   - Multiple variants per product
   - Individual pricing per variant
   - Individual stock per variant
   - Variant management in admin
   
2. ✅ **Offline Store Sales (POS)**
   - Quick sale interface
   - Barcode scanning
   - Real-time stock check
   - Cash/Card/UPI payment
   - Receipt generation
   - Daily sales tracking

3. ✅ **Enhanced Order Management**
   - Order source tracking (online/offline)
   - POS user tracking
   - Unified inventory

---

**Document Version:** 3.0  
**Date:** January 10, 2026  
**Status:** Complete Feature List  
**Next:** Implementation Plans for Backend, Mobile App, and Admin Dashboard
