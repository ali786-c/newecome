import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Product } from '@/types';

export interface CartItem {
  product: Product;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variantLabel?: string, unitPrice?: number) => void;
  removeItem: (productId: number, variantLabel?: string) => void;
  updateQuantity: (productId: number, quantity: number, variantLabel?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  couponCode: string;
  setCouponCode: (code: string) => void;
  couponApplied: boolean;
  applyCoupon: () => void;
  discount: number;
  total: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);

  const addItem = useCallback((product: Product, quantity = 1, variantLabel?: string, unitPrice?: number) => {
    setItems((prev) => {
      const key = variantLabel || 'default';
      const existing = prev.find((i) => i.product.id === product.id && (i.variantLabel || 'default') === key);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && (i.variantLabel || 'default') === key
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...prev, { product, variantLabel, quantity, unitPrice: unitPrice ?? product.price }];
    });
    setCartOpen(true);
  }, []);

  const removeItem = useCallback((productId: number, variantLabel?: string) => {
    const key = variantLabel || 'default';
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && (i.variantLabel || 'default') === key)));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number, variantLabel?: string) => {
    const key = variantLabel || 'default';
    if (quantity <= 0) {
      removeItem(productId, variantLabel);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && (i.variantLabel || 'default') === key
          ? { ...i, quantity }
          : i,
      ),
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponApplied(false);
    setCouponCode('');
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const discount = couponApplied ? subtotal * 0.1 : 0; // 10% placeholder
  const total = subtotal - discount;

  const applyCoupon = useCallback(() => {
    if (couponCode.trim().length > 0) {
      setCouponApplied(true);
    }
  }, [couponCode]);

  return (
    <CartContext.Provider
      value={{
        items, addItem, removeItem, updateQuantity, clearCart,
        itemCount, subtotal, couponCode, setCouponCode,
        couponApplied, applyCoupon, discount, total,
        isCartOpen, setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
