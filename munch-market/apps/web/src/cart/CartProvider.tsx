import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '@/lib/types';
import { CartContext, type CartContextValue, type CartItem } from './cart-context';

const STORAGE_KEY = 'munch-market.cart';

function load(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as CartItem[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load);

  const update = useCallback((fn: (current: CartItem[]) => CartItem[]) => {
    setItems((current) => {
      const next = fn(current);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const add = useCallback(
    (product: Product, quantity: number) =>
      update((current) => {
        const existing = current.find((item) => item.productId === product.id);
        if (existing) {
          return current.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }
        return [
          ...current,
          {
            productId: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            unitLabel: product.unitLabel,
            unitPrice: product.listPrice,
            quantity,
            minimumOrderableUnit: product.minimumOrderableUnit,
            orderIncrement: product.orderIncrement,
          },
        ];
      }),
    [update],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) =>
      update((current) =>
        current.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        ),
      ),
    [update],
  );

  const remove = useCallback(
    (productId: string) =>
      update((current) => current.filter((item) => item.productId !== productId)),
    [update],
  );

  const clear = useCallback(() => update(() => []), [update]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [items, add, setQuantity, remove, clear],
  );

  return <CartContext value={value}>{children}</CartContext>;
}
