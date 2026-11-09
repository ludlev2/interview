import { createContext } from 'react';
import type { Product } from '@/lib/types';

export interface CartItem {
  productId: string;
  name: string;
  imageUrl: string;
  unitLabel: string;
  unitPrice: number;
  quantity: number;
  minimumOrderableUnit: number;
  orderIncrement: number;
}

export interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (product: Product, quantity: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);
