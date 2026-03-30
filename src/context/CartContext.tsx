import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { CartItem } from '../types/order';

interface CartContextType {
  items: CartItem[];
  bakeryId: string | null;
  addItem: (item: CartItem) => boolean;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  orderPlaced: boolean;
  placeOrder: () => void;
  resetOrder: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [bakeryId, setBakeryId] = useState<string | null>(null);
  const [isCartOpen, setCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  function addItem(item: CartItem): boolean {
    if (bakeryId && bakeryId !== item.bakeryId) {
      return false;
    }
    setBakeryId(item.bakeryId);
    setItems(prev => {
      const existing = prev.find(i => i.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map(i =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    return true;
  }

  function removeItem(menuItemId: string) {
    setItems(prev => {
      const next = prev.filter(i => i.menuItemId !== menuItemId);
      if (next.length === 0) setBakeryId(null);
      return next;
    });
  }

  function updateQuantity(menuItemId: string, quantity: number) {
    if (quantity <= 0) { removeItem(menuItemId); return; }
    setItems(prev => prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i));
  }

  function clearCart() { setItems([]); setBakeryId(null); }
  function placeOrder() { setOrderPlaced(true); setCartOpen(false); }
  function resetOrder() { setOrderPlaced(false); clearCart(); }

  // No commission shown to buyer - commission is seller-side
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const total = subtotal;
  const itemCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{
      items, bakeryId, addItem, removeItem, updateQuantity, clearCart,
      subtotal, total, itemCount, isCartOpen, setCartOpen,
      orderPlaced, placeOrder, resetOrder,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be inside CartProvider');
  return ctx;
}
