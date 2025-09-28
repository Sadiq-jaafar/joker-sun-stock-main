export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  price: number;
  cost: number;
  quantity: number;
  description: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  item: InventoryItem;
  quantity: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  soldBy: string;
  soldAt: string;
  receiptNumber: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export type UserRole = 'admin' | 'user';