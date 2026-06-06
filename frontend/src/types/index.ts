// All TypeScript interfaces for the Takeout Dhanmondi app

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Food {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: Category | string;
  images: string[];
  ingredients?: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  nutritionInfo?: NutritionInfo;
  preparationTime: number;
  ratings: number;
  reviewCount: number;
  tags?: string[];
  createdAt: string;
}

export interface CartItem {
  food: Food;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  food?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Out For Delivery' | 'Delivered' | 'Cancelled';

export interface StatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  isEmailVerified: boolean;
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  customerId?: string;
  customer: { name: string; email: string };
  food: Food | string;
  order: { _id: string; orderId: string } | string;
  rating: number;
  comment: string;
  images?: string[];
  isApproved: boolean;
  createdAt: string;
}

export interface ReviewStatus {
  hasPurchased: boolean;
  hasReviewed: boolean;
  canReview: boolean;
  review: Review | null;
  deliveredOrder: { _id: string; orderId: string; createdAt: string } | null;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  description?: string;
  expiresAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  wishlist?: (Food | string)[];
  totalOrders: number;
  totalSpent: number;
  orders: Order[];
  createdAt: string;
}

export interface AdminStats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  recentOrders: Order[];
  weeklyRevenue: { _id: string; revenue: number; orders: number }[];
  changes?: {
    orders: string;
    todayOrders: string;
    revenue: string;
    customers: string;
  };
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface Notification {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  total: number;
  orderTime: string;
  itemCount: number;
  read: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
