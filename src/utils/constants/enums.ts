export const ACCESS_TOKEN_NAME = "rerokart_admin_access_token";

export enum ProductStatus {
  IN_STOCK = "in_stock",
  LOW_STOCK = "low_stock",
  OUT_OF_STOCK = "out_of_stock",
}

export const ProductStatusLabels: Record<ProductStatus, string> = {
  [ProductStatus.IN_STOCK]: "In Stock",
  [ProductStatus.LOW_STOCK]: "Low Stock",
  [ProductStatus.OUT_OF_STOCK]: "Out of Stock",
};

export enum CategoryStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export const CategoryStatusLabels: Record<CategoryStatus, string> = {
  [CategoryStatus.ACTIVE]: "Active",
  [CategoryStatus.INACTIVE]: "Inactive",
};


export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Pending",
  [OrderStatus.PROCESSING]: "Processing",
  [OrderStatus.SHIPPED]: "Shipped",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.CANCELLED]: "Cancelled",
  [OrderStatus.REFUNDED]: "Refunded",
};


export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "Pending",
  [PaymentStatus.COMPLETED]: "Completed",
  [PaymentStatus.FAILED]: "Failed",
  [PaymentStatus.REFUNDED]: "Refunded",
};

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  PAYPAL = "paypal",
  BANK_TRANSFER = "bank_transfer",
  CASH_ON_DELIVERY = "cash_on_delivery",
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CREDIT_CARD]: "Credit Card",
  [PaymentMethod.DEBIT_CARD]: "Debit Card",
  [PaymentMethod.PAYPAL]: "PayPal",
  [PaymentMethod.BANK_TRANSFER]: "Bank Transfer",
  [PaymentMethod.CASH_ON_DELIVERY]: "Cash on Delivery",
};

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  STAFF = "staff",
  CUSTOMER = "customer",
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrator",
  [UserRole.MANAGER]: "Manager",
  [UserRole.STAFF]: "Staff",
  [UserRole.CUSTOMER]: "Customer",
};

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending",
}

export const UserStatusLabels: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: "Active",
  [UserStatus.INACTIVE]: "Inactive",
  [UserStatus.SUSPENDED]: "Suspended",
  [UserStatus.PENDING]: "Pending Verification",
};


export enum BadgeVariant {
  LIGHT = "light",
  SOLID = "solid",
}

export enum BadgeColor {
  PRIMARY = "primary",
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
  LIGHT = "light",
  DARK = "dark",
}

export enum ButtonVariant {
  PRIMARY = "primary",
  OUTLINE = "outline",
}

export enum ButtonSize {
  SM = "sm",
  MD = "md",
}

export enum AvatarSize {
  XSMALL = "xsmall",
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  XLARGE = "xlarge",
  XXLARGE = "xxlarge",
}

export enum AlertVariant {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}


export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export enum TablePageSize {
  TEN = 10,
  TWENTY_FIVE = 25,
  FIFTY = 50,
  HUNDRED = 100,
}


export enum DateFormat {
  SHORT = "MM/DD/YYYY",
  LONG = "MMMM DD, YYYY",
  ISO = "YYYY-MM-DD",
  DATETIME = "MM/DD/YYYY HH:mm",
  TIME = "HH:mm",
}

export enum TimeRange {
  TODAY = "today",
  YESTERDAY = "yesterday",
  LAST_7_DAYS = "last_7_days",
  LAST_30_DAYS = "last_30_days",
  THIS_MONTH = "this_month",
  LAST_MONTH = "last_month",
  THIS_YEAR = "this_year",
  CUSTOM = "custom",
}

export const TimeRangeLabels: Record<TimeRange, string> = {
  [TimeRange.TODAY]: "Today",
  [TimeRange.YESTERDAY]: "Yesterday",
  [TimeRange.LAST_7_DAYS]: "Last 7 Days",
  [TimeRange.LAST_30_DAYS]: "Last 30 Days",
  [TimeRange.THIS_MONTH]: "This Month",
  [TimeRange.LAST_MONTH]: "Last Month",
  [TimeRange.THIS_YEAR]: "This Year",
  [TimeRange.CUSTOM]: "Custom Range",
};

export enum ShippingMethod {
  STANDARD = "standard",
  EXPRESS = "express",
  OVERNIGHT = "overnight",
  PICKUP = "pickup",
}

export const ShippingMethodLabels: Record<ShippingMethod, string> = {
  [ShippingMethod.STANDARD]: "Standard Shipping",
  [ShippingMethod.EXPRESS]: "Express Shipping",
  [ShippingMethod.OVERNIGHT]: "Overnight Shipping",
  [ShippingMethod.PICKUP]: "Store Pickup",
};


export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixed_amount",
  FREE_SHIPPING = "free_shipping",
  BUY_X_GET_Y = "buy_x_get_y",
}

export const DiscountTypeLabels: Record<DiscountType, string> = {
  [DiscountType.PERCENTAGE]: "Percentage Off",
  [DiscountType.FIXED_AMOUNT]: "Fixed Amount Off",
  [DiscountType.FREE_SHIPPING]: "Free Shipping",
  [DiscountType.BUY_X_GET_Y]: "Buy X Get Y",
};


export enum FileType {
  IMAGE = "image",
  VIDEO = "video",
  DOCUMENT = "document",
  OTHER = "other",
}

export enum ImageFormat {
  JPG = "jpg",
  JPEG = "jpeg",
  PNG = "png",
  GIF = "gif",
  WEBP = "webp",
  SVG = "svg",
}


export enum NotificationType {
  ORDER = "order",
  PRODUCT = "product",
  USER = "user",
  SYSTEM = "system",
  PROMOTION = "promotion",
}

export const NotificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.ORDER]: "Order",
  [NotificationType.PRODUCT]: "Product",
  [NotificationType.USER]: "User",
  [NotificationType.SYSTEM]: "System",
  [NotificationType.PROMOTION]: "Promotion",
};
