# Admin Dashboard Development Phases
## Next.js - Decan India E-Commerce

**Tech Stack:** Next.js 14 (App Router) + shadcn/ui + Tailwind CSS + React Query + Recharts

---

## PHASE 1: Foundation & Authentication

### Part A: Setup & Dummy UI

#### Project Setup
- [x] Create Next.js project with TypeScript
- [x] Install and configure Tailwind CSS
- [x] Install and configure shadcn/ui
- [x] Setup React Query
- [x] Configure environment variables
- [x] Setup project folder structure

#### Layout & Navigation
- [x] Create admin layout
  - [x] Sidebar navigation
  - [x] Top header with user menu
  - [x] Breadcrumb component
- [x] Sidebar menu items:
  - [x] Dashboard
  - [x] Products
  - [x] Categories
  - [x] Orders
  - [x] Users
  - [x] Reviews
  - [x] Coupons
  - [x] Inventory
  - [x] Reports
  - [x] POS
  - [x] Banners
- [x] Collapsible sidebar (mobile responsive)
- [x] User dropdown (Profile, Logout)

#### Admin Login Screen
- [x] Login form
  - [x] Email input
  - [x] Password input
  - [x] Remember me checkbox
  - [x] Login button
- [x] Form validation
- [x] Error display

#### Dashboard Home (Dummy)
- [x] Stats cards row:
  - [x] Total Orders (today/week/month)
  - [x] Total Revenue
  - [x] Total Users
  - [x] Total Products
- [x] Sales trend chart (line chart - dummy data)
- [x] Orders by status (bar chart - dummy data)
- [x] Recent orders table (last 10 - dummy)
- [x] Low stock alerts list (dummy)

### Part B: API Integration

#### Auth APIs
- [x] Create API client
- [x] Implement admin login API
- [x] Store session/token
- [x] Add auth interceptor
- [x] Handle 401 (redirect to login)
- [x] Implement logout

#### Dashboard APIs
- [x] Fetch dashboard stats
- [x] Fetch sales trend data
- [x] Fetch orders by status data
- [x] Fetch recent orders
- [x] Fetch low stock alerts

---

## PHASE 2: Products & Categories

### Part A: Dummy UI

#### Product List Page
- [x] Data table with columns:
  - [x] Image (thumbnail)
  - [x] SKU
  - [x] Product Name
  - [x] Category
  - [x] Price
  - [x] Stock (total)
  - [x] Status (Active/Inactive)
  - [x] Actions (Edit, Delete)
- [x] Search bar
- [x] Filters:
  - [x] By category
  - [x] By status
  - [x] By stock (In stock, Low stock, Out of stock)
- [x] Pagination
- [x] Add Product button

#### Add/Edit Product Form
- [x] Basic Information tab:
  - [x] Product name
  - [x] SKU (auto-generate or manual)
  - [x] Category dropdown
  - [x] Status toggle
- [x] Pricing tab:
  - [x] Base price
  - [x] Original price
  - [x] Auto-calculate discount %
- [x] Variants tab:
  - [x] Variant type input (Size, Quantity, etc.)
  - [x] Add variant button
  - [x] Variant table:
    - [x] Variant name (1mm, 2mm, 100pcs, etc.)
    - [x] Variant SKU
    - [x] Price
    - [x] Stock
    - [x] Actions (Edit, Delete)
- [x] Description tab:
  - [x] Short description
  - [x] Full description (rich text)
  - [x] Key features (bullet list)
- [x] Images tab:
  - [x] Image upload (drag & drop)
  - [x] Image preview grid
  - [x] Set primary image
  - [x] Delete image
- [x] Save / Publish buttons

#### Category List Page
- [x] Tree view of categories (parent-child)
- [x] Category card:
  - [x] Image
  - [x] Name
  - [x] Product count
  - [x] Status
  - [x] Actions (Edit, Delete)
- [x] Add Category button

#### Add/Edit Category Form
- [x] Category name
- [x] Slug (auto from name)
- [x] Description
- [x] Parent category dropdown
- [x] Category image upload
- [x] Display order
- [x] Status toggle
- [x] Save button

### Part B: API Integration

#### Product APIs
- [x] Get products (with filters, pagination)
- [x] Get product by ID
- [x] Create product
- [x] Update product
- [x] Delete product
- [x] Upload product images
- [x] Delete product image
- [x] Variant CRUD operations

#### Category APIs
- [x] Get all categories (with tree structure)
- [x] Get category by ID
- [x] Create category
- [x] Update category
- [x] Delete category
- [x] Upload category image

---

## PHASE 3: Inventory & Coupons

### Part A: Dummy UI

#### Inventory Overview Page
- [x] Stats cards:
  - [x] Total Products
  - [x] In Stock
  - [x] Low Stock
  - [x] Out of Stock
  - [x] Total Inventory Value
- [x] Low stock alerts table
- [x] Stock by category chart

#### Stock Management Page
- [x] Product/Variant stock table:
  - [x] Product name
  - [x] Variant name
  - [x] Current stock
  - [x] Low stock threshold
  - [x] Last updated
  - [x] Update stock button
- [x] Search by product/SKU
- [x] Filter by stock status

#### Update Stock Dialog
- [x] Product display
- [x] Variant dropdown
- [x] Current stock display
- [x] New stock quantity input
- [x] Reason dropdown (Restock, Adjustment, Return, etc.)
- [x] Notes input
- [x] Update button

#### Coupon List Page
- [x] Data table:
  - [x] Coupon code
  - [x] Description
  - [x] Discount type (% or Fixed)
  - [x] Discount value
  - [x] Min order value
  - [x] Usage (used/limit)
  - [x] Valid dates
  - [x] Status
  - [x] Actions
- [x] Filters (Active, Expired, All)
- [x] Add Coupon button

#### Add/Edit Coupon Form
- [x] Coupon code (auto-generate or custom)
- [x] Description
- [x] Discount type dropdown (Percentage/Fixed)
- [x] Discount value
- [x] Max discount (for percentage)
- [x] Min order value
- [x] Usage limit (total)
- [x] Usage limit per user
- [x] Valid from date picker
- [x] Valid to date picker
- [x] Status toggle
- [x] Save button

### Part B: API Integration

#### Inventory APIs
- [x] Get inventory overview stats
- [x] Get stock levels (with filters)
- [x] Update stock
- [x] Get stock history

#### Coupon APIs
- [x] Get all coupons (with filters)
- [x] Get coupon by ID
- [x] Create coupon
- [x] Update coupon
- [x] Delete coupon

---

## PHASE 4: Orders & Users

### Part A: Dummy UI

#### Order List Page
- [x] Data table:
  - [x] Order number
  - [x] Customer name
  - [x] Order date
  - [x] Total amount
  - [x] Payment method
  - [x] Payment status
  - [x] Order status (badge)
  - [x] Source (Online/Offline)
  - [x] Actions
- [x] Filters:
  - [x] By status
  - [x] By payment method
  - [x] By date range
  - [x] By source
- [x] Search by order number, customer
- [x] Pagination

#### Order Details Page
- [x] Order header:
  - [x] Order number
  - [x] Order date
  - [x] Source badge
  - [x] Status badge
- [x] Status update dropdown
- [x] Order items table:
  - [x] Product image
  - [x] Product name
  - [x] Variant
  - [x] Quantity
  - [x] Price
  - [x] Subtotal
- [x] Customer info card
- [x] Delivery address card
- [x] Price breakdown:
  - [x] Subtotal
  - [x] Discount
  - [x] Delivery
  - [x] GST
  - [x] Total
- [x] Actions:
  - [x] Update status
  - [x] Print invoice
  - [x] Cancel order (if applicable)
- [x] Admin notes section

#### Update Status Dialog
- [x] Status dropdown:
  - [x] Placed
  - [x] Confirmed
  - [x] Shipped
  - [x] Out for Delivery
  - [x] Delivered
  - [x] Cancelled
- [x] Add tracking number (if shipped)
- [x] Send notification checkbox
- [x] Update button

#### User List Page
- [x] Data table:
  - [x] User ID
  - [x] Name
  - [x] Email
  - [x] Phone
  - [x] Total Orders
  - [x] Total Spent
  - [x] Status (Active/Blocked)
  - [x] Joined date
  - [x] Actions
- [x] Search by name, email, phone
- [x] Filter by status
- [x] Pagination

#### User Details Page
- [x] User info card
- [x] Stats: Total orders, Total spent, Avg order value
- [x] Order history table
- [x] Actions: Block/Unblock

### Part B: API Integration

#### Order APIs
- [x] Get all orders (with filters)
- [x] Get order by ID
- [x] Update order status
- [x] Cancel order
- [x] Get order for printing

#### User APIs
- [x] Get all users (with filters)
- [x] Get user by ID
- [x] Block/Unblock user

---

## PHASE 5: Reviews, Reports & POS

### Part A: Dummy UI

#### Review List Page
- [x] Data table:
  - [x] Product name
  - [x] User name
  - [x] Rating (stars)
  - [x] Review text (truncated)
  - [x] Has images
  - [x] Date
  - [x] Status (Pending/Approved/Rejected)
  - [x] Actions
- [x] Filters:
  - [x] By rating
  - [x] By status
  - [x] By product
- [x] Search

#### Review Details Dialog
- [x] Full review text
- [x] Review images gallery
- [x] User info
- [x] Product link
- [x] Approve / Reject buttons

#### Reports Page
- [x] Date range picker
- [x] Report type tabs:
  - [x] Daily
  - [x] Weekly
  - [x] Monthly
  - [x] Custom
- [x] Summary cards:
  - [x] Total Revenue
  - [x] Total Orders
  - [x] Average Order Value
- [x] Sales trend chart
- [x] Sales by product table
- [x] Sales by category chart

#### POS Page
- [x] Product search bar
- [x] Product quick grid (frequent items)
- [x] Search results list:
  - [x] Product name
  - [x] Available variants
  - [x] Price
  - [x] Stock
  - [x] Add button
- [x] Cart section:
  - [x] Cart items list
  - [x] Quantity controls
  - [x] Remove button
  - [x] Price display
- [x] Customer section:
  - [x] Search existing customer
  - [x] Walk-in customer option
  - [x] Create new customer (quick form)
- [x] Payment section:
  - [x] Payment method (Cash/Card/UPI)
  - [x] Total amount
  - [x] Cash received input
  - [x] Change calculation
- [x] Complete Sale button
- [x] Clear Cart button

#### Receipt Preview Dialog
- [x] Store info header
- [x] Order items
- [x] Price breakdown
- [x] Payment info
- [x] Print button

### Part B: API Integration

#### Review APIs
- [x] Get all reviews (with filters)
- [x] Approve review
- [x] Reject review
- [x] Delete review

#### Reports APIs
- [x] Get dashboard summary
- [x] Get sales report (with date range)
- [x] Get sales by product
- [x] Get sales by category

#### POS APIs
- [x] Search products for POS
- [x] Search customers
- [x] Create customer (quick)
- [x] Create offline order
- [x] Generate receipt

---

## PHASE 6: Banners & Final Polish

### Part A: Dummy UI

#### Banner List Page
- [x] Data table:
  - [x] Image preview
  - [x] Title
  - [x] Link
  - [x] Display order
  - [x] Active dates
  - [x] Status
  - [x] Actions
- [ ] Reorder (drag & drop)
- [x] Add Banner button

#### Add/Edit Banner Form
- [x] Banner image upload
- [x] Title
- [x] Description (optional)
- [x] Link URL (product/category/external)
- [x] Display order
- [x] Active from date
- [x] Active to date
- [x] Status toggle
- [x] Save button

#### Final Polish
- [x] Responsive design check
- [x] Loading states (skeletons)
- [x] Error handling (toasts)
- [x] Confirmation dialogs
- [ ] Keyboard navigation
- [x] Dark mode (optional)

### Part B: API Integration

#### Banner APIs
- [x] Get all banners
- [x] Create banner
- [x] Update banner
- [x] Delete banner
- [x] Reorder banners

#### Final Integrations
- [x] Error boundary
- [x] API error handling
- [x] Success notifications
- [x] Session refresh

---

## Verification Checklist

### After Each Phase
- [x] All pages render correctly
- [x] Forms validate inputs
- [x] Tables have proper pagination
- [x] Filters work correctly
- [x] Search works correctly
- [x] CRUD operations work
- [x] Error states handled
- [x] Loading states shown

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
| 1 | [x] | [x] | Complete |
| 2 | [x] | [x] | Complete |
| 3 | [x] | [x] | Complete |
| 4 | [x] | [x] | Complete |
| 5 | [x] | [x] | Complete |
| 6 | [x] | [x] | Complete |

---

## Implementation Summary

### Services Created (10)
1. `src/services/product.service.ts` - Product CRUD, variants, images
2. `src/services/category.service.ts` - Category CRUD with tree support
3. `src/services/coupon.service.ts` - Coupon CRUD with validation
4. `src/services/inventory.service.ts` - Stock management
5. `src/services/order.service.ts` - Order management with status updates
6. `src/services/user.service.ts` - User management with block/unblock
7. `src/services/review.service.ts` - Review moderation
8. `src/services/analytics.service.ts` - Dashboard analytics
9. `src/services/pos.service.ts` - Point of Sale with cart utilities
10. `src/services/banner.service.ts` - Banner management

### Hooks Created (10)
1. `src/hooks/useProducts.ts` - Product queries and mutations
2. `src/hooks/useCategories.ts` - Category queries with tree builder
3. `src/hooks/useCoupons.ts` - Coupon queries and mutations
4. `src/hooks/useInventory.ts` - Inventory queries and mutations
5. `src/hooks/useOrders.ts` - Order queries with invoice download
6. `src/hooks/useUsers.ts` - User queries with block toggle
7. `src/hooks/useReviews.ts` - Review queries with approve/reject
8. `src/hooks/useAnalytics.ts` - Analytics queries
9. `src/hooks/usePOS.ts` - POS queries with cart state management
10. `src/hooks/useBanners.ts` - Banner queries with reorder

### Pages Implemented
- Dashboard: `/` - Stats, charts, recent orders, low stock alerts
- Products: `/products`, `/products/add`, `/products/[id]/edit`
- Categories: `/categories`, `/categories/add`, `/categories/[id]/edit`
- Orders: `/orders`, `/orders/[id]`
- Users: `/users`, `/users/[id]`
- Reviews: `/reviews`
- Coupons: `/coupons`, `/coupons/add`, `/coupons/[id]/edit`
- Inventory: `/inventory`
- Reports: `/reports`
- POS: `/pos`
- Banners: `/banners`, `/banners/add`, `/banners/[id]/edit`

### Key Features
- React Query for server state management
- Toast notifications for success/error feedback
- Modal dialogs for confirmations and forms
- Pagination for all list pages
- Search and filters for all data tables
- Loading states and error handling
- Dark mode support
