// src/types/index.ts

export interface OrderDetail {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: { id: string };
  shippingAddress: string;
  orderDetails: OrderDetail[];
  total: number;
  status: string;
  paymentStatus: string;
  transactionId?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Payment {
  id: string;
  order: { orderNumber: string };
  amount: number;
  status: string;
  transactionId: string;
  errorMessage?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  deleted?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  deleted?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  supplier: Supplier;
  category: Category;
  imageUrl?: string;
  deleted?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartApiResponse {
  items: CartItem[];
}
