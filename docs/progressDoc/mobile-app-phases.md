# Mobile App Development Phases
## React Native Expo - Rerokart E-Commerce

**Tech Stack:** Expo + React Native + NativeWind + React Native Paper + Zustand + React Query

---

## PHASE 1: Foundation & Authentication

### Part A: Setup & Dummy UI

#### Project Setup
- [ ] Create Expo project with TypeScript
- [ ] Install and configure NativeWind (Tailwind CSS)
- [ ] Install and configure React Native Paper
- [ ] Setup Zustand for state management
- [ ] Setup React Query for API calls
- [ ] Configure environment variables (.env)
- [ ] Setup project folder structure

#### Navigation
- [ ] Setup Expo Router
- [ ] Create root layout with providers (Paper, Query, SafeArea)
- [ ] Create bottom tabs layout (Home, Categories, Cart, Profile)
- [ ] Create auth stack (Login, Register, Forgot Password)
- [ ] Create shop stack (Products, Product Details, Search)
- [ ] Create user stack (Orders, Profile, Addresses)
- [ ] Create checkout stack (Address, Summary, Payment, Success)

#### Auth Screens (Dummy)
- [ ] Login screen
  - [ ] Email input
  - [ ] Password input (with show/hide toggle)
  - [ ] Login button
  - [ ] Forgot password link
  - [ ] Register link
- [ ] Register screen
  - [ ] Full name input
  - [ ] Email input
  - [ ] Mobile number input (10 digits)
  - [ ] Password input (with strength indicator)
  - [ ] Confirm password input
  - [ ] Terms checkbox
  - [ ] Register button
- [ ] Forgot Password screen
  - [ ] Email input
  - [ ] Send reset link button
  - [ ] Back to login link

#### Home Screen (Dummy)
- [ ] Header with search bar and cart icon
- [ ] Banner slider component (3 dummy banners)
- [ ] Category grid (6 dummy categories)
- [ ] Featured products section (horizontal scroll)
- [ ] Latest products section (horizontal scroll)
- [ ] Pull to refresh

#### UI Components
- [ ] Button component (primary, secondary, outline)
- [ ] TextInput component (with error state)
- [ ] Card component
- [ ] Loading spinner
- [ ] Empty state component
- [ ] Error boundary

### Part B: API Integration

#### Auth APIs
- [ ] Create API client (Axios with interceptors)
- [ ] Implement register API call
- [ ] Implement login API call
- [ ] Implement logout API call
- [ ] Implement forgot password API call
- [ ] Implement reset password API call
- [ ] Implement get current user API call

#### Auth State Management
- [ ] Create auth store (Zustand with persist)
- [ ] Store user data on login
- [ ] Store JWT token in SecureStore
- [ ] Add token to API requests (interceptor)
- [ ] Handle 401 errors (auto logout)
- [ ] Implement protected routes

#### Home Data
- [ ] Fetch banners from API
- [ ] Fetch categories from API
- [ ] Fetch featured products from API
- [ ] Fetch latest products from API
- [ ] Handle loading states
- [ ] Handle error states

---

## PHASE 2: Products & Categories

### Part A: Dummy UI

#### Categories Screen
- [ ] Category grid layout (2 columns)
- [ ] Category card (image, name, product count)
- [ ] Tap to view category products

#### Product Listing Screen
- [ ] Product grid view (2 columns)
- [ ] Product list view (1 column)
- [ ] View toggle button (grid/list)
- [ ] Product card component
  - [ ] Product image
  - [ ] Product name (2 lines max)
  - [ ] Price (current + original with strikethrough)
  - [ ] Discount badge
  - [ ] Rating stars
  - [ ] Wishlist heart icon
  - [ ] Stock status badge
- [ ] Filter button (opens bottom sheet)
- [ ] Sort button (opens bottom sheet)
- [ ] Infinite scroll / Load more

#### Filters Bottom Sheet
- [ ] Price range slider
- [ ] Rating filter (4+, 3+, etc.)
- [ ] Stock filter (In stock only)
- [ ] Apply / Clear buttons

#### Sort Bottom Sheet
- [ ] Relevance
- [ ] Price: Low to High
- [ ] Price: High to Low
- [ ] Newest First
- [ ] Rating: High to Low

#### Product Details Screen
- [ ] Image gallery (swipe, zoom)
- [ ] Product name
- [ ] SKU
- [ ] Rating & review count
- [ ] Price section (current, original, discount)
- [ ] Variant selector component (flexible: 1mm, 100pcs, etc.)
- [ ] Stock status
- [ ] Description (expandable)
- [ ] Add to cart button (bottom fixed)
- [ ] Wishlist button

#### Variant Selector Component
- [ ] Display available variants as chips/buttons
- [ ] Show price per variant
- [ ] Show stock per variant
- [ ] Disable out-of-stock variants
- [ ] Selected variant indicator

#### Search Screen
- [ ] Search input (auto-focus)
- [ ] Recent searches (stored locally)
- [ ] Clear recent searches
- [ ] Search results (product list)
- [ ] No results state

### Part B: API Integration

#### Category APIs
- [ ] Fetch all categories
- [ ] Fetch category by ID
- [ ] Fetch products by category

#### Product APIs
- [ ] Fetch products with filters
  - [ ] Category filter
  - [ ] Price range filter
  - [ ] Rating filter
  - [ ] Stock filter
  - [ ] Sort options
  - [ ] Pagination (page, limit)
- [ ] Fetch product by ID (with variants)
- [ ] Fetch product variants
- [ ] Search products API

#### React Query Integration
- [ ] useCategories hook
- [ ] useProducts hook (with infinite query)
- [ ] useProduct hook
- [ ] useSearchProducts hook
- [ ] Cache invalidation strategy

---

## PHASE 3: Cart, Wishlist & Checkout

### Part A: Dummy UI

#### Cart Screen
- [ ] Cart item component
  - [ ] Product image
  - [ ] Product name
  - [ ] Selected variant
  - [ ] Price per unit
  - [ ] Quantity selector (+/-)
  - [ ] Subtotal
  - [ ] Remove button
  - [ ] Move to wishlist button
- [ ] Cart summary
  - [ ] Items total
  - [ ] Discount (if coupon)
  - [ ] Delivery charge (fixed)
  - [ ] GST (18%)
  - [ ] Grand total
- [ ] Coupon input section
- [ ] Proceed to checkout button
- [ ] Empty cart state

#### Wishlist Screen
- [ ] Wishlist item grid
- [ ] Add to cart button per item
- [ ] Remove from wishlist button
- [ ] Empty wishlist state

#### Checkout - Address Selection
- [ ] List saved addresses (radio select)
- [ ] Add new address button
- [ ] Edit address button
- [ ] Selected address highlight
- [ ] Continue button

#### Add/Edit Address Form
- [ ] Full name input
- [ ] Mobile number input
- [ ] Address line 1 input
- [ ] Address line 2 input
- [ ] City input
- [ ] State dropdown
- [ ] Pincode input
- [ ] Address type (Home/Work/Other)
- [ ] Set as default checkbox
- [ ] Save button

#### Checkout - Order Summary
- [ ] Order items list
- [ ] Selected address display
- [ ] Price breakdown
- [ ] Apply coupon section
- [ ] Continue to payment button

#### Checkout - Payment Selection
- [ ] COD option (selected by default)
- [ ] Online payment option (placeholder for Phase 6)
- [ ] Place order button

#### Order Success Screen
- [ ] Success animation/icon
- [ ] Order number
- [ ] Estimated delivery message
- [ ] View order button
- [ ] Continue shopping button

### Part B: API Integration

#### Cart APIs
- [ ] Create cart store (Zustand with persist)
- [ ] Sync cart with server (on login)
- [ ] Add to cart API
- [ ] Update cart item quantity API
- [ ] Remove from cart API
- [ ] Clear cart API

#### Wishlist APIs
- [ ] Create wishlist store
- [ ] Add to wishlist API
- [ ] Remove from wishlist API
- [ ] Get wishlist API

#### Address APIs
- [ ] Get user addresses API
- [ ] Add address API
- [ ] Update address API
- [ ] Delete address API
- [ ] Set default address API

#### Coupon APIs
- [ ] Validate coupon API
- [ ] Apply coupon to cart

#### Order APIs
- [ ] Create order API (COD)
- [ ] Calculate order totals (subtotal, tax, delivery, total)

---

## PHASE 4: Orders & User Management

### Part A: Dummy UI

#### Order History Screen
- [ ] Order card component
  - [ ] Order number
  - [ ] Order date
  - [ ] Status badge (color coded)
  - [ ] Total amount
  - [ ] Item thumbnails (max 3)
  - [ ] View details button
- [ ] Order filters (All, Delivered, In Transit, Cancelled)
- [ ] Empty orders state

#### Order Details Screen
- [ ] Order number (large)
- [ ] Order status timeline
  - [ ] Order Placed
  - [ ] Order Confirmed
  - [ ] Shipped
  - [ ] Out for Delivery
  - [ ] Delivered
- [ ] Order items list
- [ ] Delivery address
- [ ] Payment method
- [ ] Price breakdown
- [ ] Cancel order button (if not shipped)
- [ ] Download invoice button

#### Cancel Order Flow
- [ ] Cancellation reason dropdown
- [ ] Confirm cancellation dialog

#### User Profile Screen
- [ ] Profile header (avatar, name, email)
- [ ] Menu items:
  - [ ] Edit Profile
  - [ ] My Addresses
  - [ ] My Orders
  - [ ] My Wishlist
  - [ ] Change Password
  - [ ] About Us
  - [ ] Contact Us
  - [ ] Privacy Policy
  - [ ] Terms & Conditions
  - [ ] Logout

#### Edit Profile Screen
- [ ] Profile picture (view/change)
- [ ] Full name input
- [ ] Email input (readonly or with verification)
- [ ] Mobile number input
- [ ] Save button

#### Change Password Screen
- [ ] Current password input
- [ ] New password input
- [ ] Confirm new password input
- [ ] Update button

#### Address Management Screen
- [ ] List all addresses
- [ ] Default address indicator
- [ ] Add new address button
- [ ] Edit/Delete address options

### Part B: API Integration

#### Order APIs
- [ ] Get user orders API
- [ ] Get order details API
- [ ] Cancel order API

#### Profile APIs
- [ ] Get user profile API
- [ ] Update user profile API
- [ ] Upload profile picture API
- [ ] Change password API

#### Address Management
- [ ] Full CRUD for addresses
- [ ] Set default address

---

## PHASE 5: Reviews & Static Pages

### Part A: Dummy UI

#### Product Reviews Section (in Product Details)
- [ ] Rating summary
  - [ ] Average rating (stars)
  - [ ] Rating distribution bars
  - [ ] Total review count
- [ ] Review list
  - [ ] Reviewer name
  - [ ] Rating stars
  - [ ] Review text
  - [ ] Review date
  - [ ] Review images (if any)
- [ ] Write review button (if purchased)

#### Write Review Screen
- [ ] Star rating input (1-5)
- [ ] Review title input
- [ ] Review text input
- [ ] Add images button (max 3)
- [ ] Submit button

#### Static Pages (Hardcoded)
- [ ] About Us screen
- [ ] Contact Us screen
  - [ ] Contact form (name, email, message)
  - [ ] Phone number (clickable)
  - [ ] Email (clickable)
- [ ] Privacy Policy screen (scrollable text)
- [ ] Terms & Conditions screen (scrollable text)

### Part B: API Integration

#### Review APIs
- [ ] Get product reviews API
- [ ] Submit review API
- [ ] Upload review images API

---

## PHASE 6: Payment & Delivery Status

### Part A: Dummy UI

#### Payment Method Screen (Enhanced)
- [ ] COD option
- [ ] Online payment option (Razorpay)
- [ ] Payment method icons

#### Order Tracking Screen
- [ ] Order status header
- [ ] Status timeline (with timestamps)
  - [ ] Order Placed - [date time]
  - [ ] Confirmed - [date time]
  - [ ] Shipped - [date time]
  - [ ] Out for Delivery - [date time]
  - [ ] Delivered - [date time]
- [ ] Estimated delivery date
- [ ] Delivery address

#### Invoice Download
- [ ] Download invoice button in order details
- [ ] PDF viewer or share option

### Part B: API Integration

#### Payment APIs
- [ ] Create Razorpay order API
- [ ] Razorpay checkout integration
- [ ] Verify payment API
- [ ] Handle payment success/failure

#### Tracking APIs
- [ ] Get order tracking details API

#### Invoice APIs
- [ ] Download invoice PDF API

---

## Verification Checklist

### After Each Phase
- [ ] All screens render correctly
- [ ] Navigation works properly
- [ ] Forms validate inputs
- [ ] Error states are handled
- [ ] Loading states are shown
- [ ] Empty states are displayed
- [ ] Pull to refresh works (where applicable)

### Final Testing
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on physical device
- [ ] Test offline mode (basic)
- [ ] Test with slow network

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
