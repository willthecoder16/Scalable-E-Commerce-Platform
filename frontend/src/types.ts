export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: string;
  categoryName?: string;
  imageUrl?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  total?: number;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  total: number;
  shippingAddress?: Record<string, string>;
  paymentId?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state?: string;
  zip: string;
  country?: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  description: string;
  currencies: string[];
  mode: 'mock' | 'live';
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  transactionId?: string;
  cardBrand?: string;
  cardLast4?: string;
  paypalEmail?: string;
  createdAt?: string;
}

export interface Notification {
  id: string;
  type: 'email' | 'sms';
  to: string;
  subject?: string;
  body?: string;
  message?: string;
  userId?: string;
  orderId?: string;
  eventType?: string;
  status: string;
  sentAt: string;
  provider: string;
}
