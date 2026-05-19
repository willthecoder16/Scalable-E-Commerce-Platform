import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../api/client';
import type { Cart, Product } from '../types';
import { useAuth } from './AuthContext';

interface CartState {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const { cart: c } = await api.getCart(user.id);
      setCart(c);
    } catch {
      setCart({ userId: user.id, items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (product: Product, quantity = 1) => {
      if (!user?.id) throw new Error('Sign in to add items');
      const { cart: c } = await api.addToCart(user.id, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
      });
      setCart(c);
    },
    [user?.id]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (!user?.id) return;
      const { cart: c } = await api.updateCartItem(user.id, productId, quantity);
      setCart(c);
    },
    [user?.id]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (!user?.id) return;
      const { cart: c } = await api.removeFromCart(user.id, productId);
      setCart(c);
    },
    [user?.id]
  );

  const itemCount = useMemo(
    () => cart?.items?.reduce((n, i) => n + i.quantity, 0) ?? 0,
    [cart]
  );

  const value = useMemo(
    () => ({ cart, itemCount, loading, refresh, addItem, updateQuantity, removeItem }),
    [cart, itemCount, loading, refresh, addItem, updateQuantity, removeItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
