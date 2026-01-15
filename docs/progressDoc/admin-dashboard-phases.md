# Admin Dashboard Development Phases
## Next.js - Decan India E-Commerce

**Tech Stack:** Next.js 14 (App Router) + shadcn/ui + Tailwind CSS + React Query + Recharts

---

## PHASE 1: Foundation & Authentication

### Part A: Setup & Dummy UI

#### Project Setup
- [ ] Create Next.js project with TypeScript
- [ ] Install and configure Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Setup React Query
- [ ] Configure environment variables
- [ ] Setup project folder structure

#### Layout & Navigation
- [ ] Create admin layout
  - [ ] Sidebar navigation
  - [ ] Top header with user menu
  - [ ] Breadcrumb component
- [ ] Sidebar menu items:
  - [ ] Dashboard
  - [ ] Products
  - [ ] Categories
  - [ ] Orders
  - [ ] Users
  - [ ] Reviews
  - [ ] Coupons
  - [ ] Inventory
  - [ ] Reports
  - [ ] POS
  - [ ] Banners
- [ ] Collapsible sidebar (mobile responsive)
- [ ] User dropdown (Profile, Logout)

#### Admin Login Screen
- [ ] Login form
  - [ ] Email input
  - [ ] Password input
  - [ ] Remember me checkbox
  - [ ] Login button
- [ ] Form validation
- [ ] Error display

#### Dashboard Home (Dummy)
- [ ] Stats cards row:
  - [ ] Total Orders (today/week/month)
  - [ ] Total Revenue
  - [ ] Total Users
  - [ ] Total Products
- [ ] Sales trend chart (line chart - dummy data)
- [ ] Orders by status (bar chart - dummy data)
- [ ] Recent orders table (last 10 - dummy)
- [ ] Low stock alerts list (dummy)

### Part B: API Integration

#### Auth APIs
- [ ] Create API client
- [ ] Implement admin login API
- [ ] Store session/token
- [ ] Add auth interceptor
- [ ] Handle 401 (redirect to login)
- [ ] Implement logout

#### Dashboard APIs
- [ ] Fetch dashboard stats
- [ ] Fetch sales trend data
- [ ] Fetch orders by status data
- [ ] Fetch recent orders
- [ ] Fetch low stock alerts

---

## PHASE 2: Products & Categories

### Part A: Dummy UI

#### Product List Page
- [ ] Data table with columns:
  - [ ] Image (thumbnail)
  - [ ] SKU
  - [ ] Product Name
  - [ ] Category
  - [ ] Price
  - [ ] Stock (total)
  - [ ] Status (Active/Inactive)
  - [ ] Actions (Edit, Delete)
- [ ] Search bar
- [ ] Filters:
  - [ ] By category
  - [ ] By status
  - [ ] By stock (In stock, Low stock, Out of stock)
- [ ] Pagination
- [ ] Add Product button

#### Add/Edit Product Form
- [ ] Basic Information tab:
  - [ ] Product name
  - [ ] SKU (auto-generate or manual)
  - [ ] Category dropdown
  - [ ] Status toggle
- [ ] Pricing tab:
  - [ ] Base price
  - [ ] Original price
  - [ ] Auto-calculate discount %
- [ ] Variants tab:
  - [ ] Variant type input (Size, Quantity, etc.)
  - [ ] Add variant button
  - [ ] Variant table:
    - [ ] Variant name (1mm, 2mm, 100pcs, etc.)
    - [ ] Variant SKU
    - [ ] Price
    - [ ] Stock
    - [ ] Actions (Edit, Delete)
- [ ] Description tab:
  - [ ] Short description
  - [ ] Full description (rich text)
  - [ ] Key features (bullet list)
- [ ] Images tab:
  - [ ] Image upload (drag & drop)
  - [ ] Image preview grid
  - [ ] Set primary image
  - [ ] Delete image
- [ ] Save / Publish buttons

#### Category List Page
- [ ] Tree view of categories (parent-child)
- [ ] Category card:
  - [ ] Image
  - [ ] Name
  - [ ] Product count
  - [ ] Status
  - [ ] Actions (Edit, Delete)
- [ ] Add Category button

#### Add/Edit Category Form
- [ ] Category name
- [ ] Slug (auto from name)
- [ ] Description
- [ ] Parent category dropdown
- [ ] Category image upload
- [ ] Display order
- [ ] Status toggle
- [ ] Save button

### Part B: API Integration

#### Product APIs
- [ ] Get products (with filters, pagination)
- [ ] Get product by ID
- [ ] Create product
- [ ] Update product
- [ ] Delete product
- [ ] Upload product images
- [ ] Delete product image
- [ ] Variant CRUD operations

#### Category APIs
- [ ] Get all categories (with tree structure)
- [ ] Get category by ID
- [ ] Create category
- [ ] Update category
- [ ] Delete category
- [ ] Upload category image

---

## PHASE 3: Inventory & Coupons

### Part A: Dummy UI

#### Inventory Overview Page
- [ ] Stats cards:
  - [ ] Total Products
  - [ ] In Stock
  - [ ] Low Stock
  - [ ] Out of Stock
  - [ ] Total Inventory Value
- [ ] Low stock alerts table
- [ ] Stock by category chart

#### Stock Management Page
- [ ] Product/Variant stock table:
  - [ ] Product name
  - [ ] Variant name
  - [ ] Current stock
  - [ ] Low stock threshold
  - [ ] Last updated
  - [ ] Update stock button
- [ ] Search by product/SKU
- [ ] Filter by stock status

#### Update Stock Dialog
- [ ] Product display
- [ ] Variant dropdown
- [ ] Current stock display
- [ ] New stock quantity input
- [ ] Reason dropdown (Restock, Adjustment, Return, etc.)
- [ ] Notes input
- [ ] Update button

#### Coupon List Page
- [ ] Data table:
  - [ ] Coupon code
  - [ ] Description
  - [ ] Discount type (% or Fixed)
  - [ ] Discount value
  - [ ] Min order value
  - [ ] Usage (used/limit)
  - [ ] Valid dates
  - [ ] Status
  - [ ] Actions
- [ ] Filters (Active, Expired, All)
- [ ] Add Coupon button

#### Add/Edit Coupon Form
- [ ] Coupon code (auto-generate or custom)
- [ ] Description
- [ ] Discount type dropdown (Percentage/Fixed)
- [ ] Discount value
- [ ] Max discount (for percentage)
- [ ] Min order value
- [ ] Usage limit (total)
- [ ] Usage limit per user
- [ ] Valid from date picker
- [ ] Valid to date picker
- [ ] Status toggle
- [ ] Save button

### Part B: API Integration

#### Inventory APIs
- [ ] Get inventory overview stats
- [ ] Get stock levels (with filters)
- [ ] Update stock
- [ ] Get stock history

#### Coupon APIs
- [ ] Get all coupons (with filters)
- [ ] Get coupon by ID
- [ ] Create coupon
- [ ] Update coupon
- [ ] Delete coupon

---

## PHASE 4: Orders & Users

### Part A: Dummy UI

#### Order List Page
- [ ] Data table:
  - [ ] Order number
  - [ ] Customer name
  - [ ] Order date
  - [ ] Total amount
  - [ ] Payment method
  - [ ] Payment status
  - [ ] Order status (badge)
  - [ ] Source (Online/Offline)
  - [ ] Actions
- [ ] Filters:
  - [ ] By status
  - [ ] By payment method
  - [ ] By date range
  - [ ] By source
- [ ] Search by order number, customer
- [ ] Pagination

#### Order Details Page
- [ ] Order header:
  - [ ] Order number
  - [ ] Order date
  - [ ] Source badge
  - [ ] Status badge
- [ ] Status update dropdown
- [ ] Order items table:
  - [ ] Product image
  - [ ] Product name
  - [ ] Variant
  - [ ] Quantity
  - [ ] Price
  - [ ] Subtotal
- [ ] Customer info card
- [ ] Delivery address card
- [ ] Price breakdown:
  - [ ] Subtotal
  - [ ] Discount
  - [ ] Delivery
  - [ ] GST
  - [ ] Total
- [ ] Actions:
  - [ ] Update status
  - [ ] Print invoice
  - [ ] Cancel order (if applicable)
- [ ] Admin notes section

#### Update Status Dialog
- [ ] Status dropdown:
  - [ ] Placed
  - [ ] Confirmed
  - [ ] Shipped
  - [ ] Out for Delivery
  - [ ] Delivered
  - [ ] Cancelled
- [ ] Add tracking number (if shipped)
- [ ] Send notification checkbox
- [ ] Update button

#### User List Page
- [ ] Data table:
  - [ ] User ID
  - [ ] Name
  - [ ] Email
  - [ ] Phone
  - [ ] Total Orders
  - [ ] Total Spent
  - [ ] Status (Active/Blocked)
  - [ ] Joined date
  - [ ] Actions
- [ ] Search by name, email, phone
- [ ] Filter by status
- [ ] Pagination

#### User Details Page
- [ ] User info card
- [ ] Stats: Total orders, Total spent, Avg order value
- [ ] Order history table
- [ ] Actions: Block/Unblock

### Part B: API Integration

#### Order APIs
- [ ] Get all orders (with filters)
- [ ] Get order by ID
- [ ] Update order status
- [ ] Cancel order
- [ ] Get order for printing

#### User APIs
- [ ] Get all users (with filters)
- [ ] Get user by ID
- [ ] Block/Unblock user

---

## PHASE 5: Reviews, Reports & POS

### Part A: Dummy UI

#### Review List Page
- [ ] Data table:
  - [ ] Product name
  - [ ] User name
  - [ ] Rating (stars)
  - [ ] Review text (truncated)
  - [ ] Has images
  - [ ] Date
  - [ ] Status (Pending/Approved/Rejected)
  - [ ] Actions
- [ ] Filters:
  - [ ] By rating
  - [ ] By status
  - [ ] By product
- [ ] Search

#### Review Details Dialog
- [ ] Full review text
- [ ] Review images gallery
- [ ] User info
- [ ] Product link
- [ ] Approve / Reject buttons

#### Reports Page
- [ ] Date range picker
- [ ] Report type tabs:
  - [ ] Daily
  - [ ] Weekly
  - [ ] Monthly
  - [ ] Custom
- [ ] Summary cards:
  - [ ] Total Revenue
  - [ ] Total Orders
  - [ ] Average Order Value
- [ ] Sales trend chart
- [ ] Sales by product table
- [ ] Sales by category chart

#### POS Page
- [ ] Product search bar
- [ ] Product quick grid (frequent items)
- [ ] Search results list:
  - [ ] Product name
  - [ ] Available variants
  - [ ] Price
  - [ ] Stock
  - [ ] Add button
- [ ] Cart section:
  - [ ] Cart items list
  - [ ] Quantity controls
  - [ ] Remove button
  - [ ] Price display
- [ ] Customer section:
  - [ ] Search existing customer
  - [ ] Walk-in customer option
  - [ ] Create new customer (quick form)
- [ ] Payment section:
  - [ ] Payment method (Cash/Card/UPI)
  - [ ] Total amount
  - [ ] Cash received input
  - [ ] Change calculation
- [ ] Complete Sale button
- [ ] Clear Cart button

#### Receipt Preview Dialog
- [ ] Store info header
- [ ] Order items
- [ ] Price breakdown
- [ ] Payment info
- [ ] Print button

### Part B: API Integration

#### Review APIs
- [ ] Get all reviews (with filters)
- [ ] Approve review
- [ ] Reject review
- [ ] Delete review

#### Reports APIs
- [ ] Get dashboard summary
- [ ] Get sales report (with date range)
- [ ] Get sales by product
- [ ] Get sales by category

#### POS APIs
- [ ] Search products for POS
- [ ] Search customers
- [ ] Create customer (quick)
- [ ] Create offline order
- [ ] Generate receipt

---

## PHASE 6: Banners & Final Polish

### Part A: Dummy UI

#### Banner List Page
- [ ] Data table:
  - [ ] Image preview
  - [ ] Title
  - [ ] Link
  - [ ] Display order
  - [ ] Active dates
  - [ ] Status
  - [ ] Actions
- [ ] Reorder (drag & drop)
- [ ] Add Banner button

#### Add/Edit Banner Form
- [ ] Banner image upload
- [ ] Title
- [ ] Description (optional)
- [ ] Link URL (product/category/external)
- [ ] Display order
- [ ] Active from date
- [ ] Active to date
- [ ] Status toggle
- [ ] Save button

#### Final Polish
- [ ] Responsive design check
- [ ] Loading states (skeletons)
- [ ] Error handling (toasts)
- [ ] Confirmation dialogs
- [ ] Keyboard navigation
- [ ] Dark mode (optional)

### Part B: API Integration

#### Banner APIs
- [ ] Get all banners
- [ ] Create banner
- [ ] Update banner
- [ ] Delete banner
- [ ] Reorder banners

#### Final Integrations
- [ ] Error boundary
- [ ] API error handling
- [ ] Success notifications
- [ ] Session refresh

---

## Verification Checklist

### After Each Phase
- [ ] All pages render correctly
- [ ] Forms validate inputs
- [ ] Tables have proper pagination
- [ ] Filters work correctly
- [ ] Search works correctly
- [ ] CRUD operations work
- [ ] Error states handled
- [ ] Loading states shown

### Final Testing
- [ ] Test on desktop (various widths)
- [ ] Test on tablet
- [ ] Test on mobile
- [ ] Test all forms
- [ ] Test all tables
- [ ] Test navigation

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
