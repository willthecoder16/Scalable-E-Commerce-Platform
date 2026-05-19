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
