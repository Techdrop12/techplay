// src/context/cartContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { event, trackAddToCart } from '@/lib/ga';

const STORAGE_KEY = 'cart';

export type CartItem = {
  _id: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
};

export type CartInput = Omit<CartItem, 'quantity'> & { quantity?: number };

export interface CartContextValue {
  cart: CartItem[];
  addToCart: (item: CartInput) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  // Sélecteurs utiles
  count: number; // nombre total d’articles (somme des quantités)
  total: number; // total en €
  isInCart: (id: string) => boolean;
  getItemQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// --- Helpers storage safe ---
function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    // garde-fous de structure
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(Boolean)
      .map((it) => ({
        _id: String(it._id),
        slug: String(it.slug),
        title: it.title ?? 'Produit',
        image: it.image ?? '/placeholder.png',
        price: Number(it.price) || 0,
        quantity: Math.max(1, Number(it.quantity) || 1),
      })) as CartItem[];
  } catch {
    return [];
  }
}

function writeCart(cart: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    // notifier les autres onglets & composants
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
  } catch {
    // pas de crash si quota dépassé
    // eslint-disable-next-line no-console
    console.warn('Impossible d’enregistrer le panier.');
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const hydrated = useRef(false);

  // Hydratation initiale
  useEffect(() => {
    setCart(readCart());
    hydrated.current = true;
  }, []);

  // Persist à chaque modif
  useEffect(() => {
    if (!hydrated.current) return;
    writeCart(cart);
  }, [cart]);

  // Synchronisation multi-onglet
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setCart(readCart());
      }
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<CartItem[]>).detail;
      if (detail) setCart(detail);
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('cart-updated', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cart-updated', onCustom as EventListener);
    };
  }, []);

  // Sélecteurs
  const count = useMemo(
    () => cart.reduce((s, it) => s + (it.quantity || 1), 0),
    [cart]
  );
  const total = useMemo(
    () => cart.reduce((s, it) => s + (Number(it.price) || 0) * (it.quantity || 1), 0),
    [cart]
  );

  const isInCart = (id: string) => cart.some((it) => it._id === id);
  const getItemQuantity = (id: string) =>
    cart.find((it) => it._id === id)?.quantity || 0;

  // Actions
  const addToCart = (input: CartInput) => {
    const item: CartItem = {
      ...input,
      title: input.title ?? 'Produit',
      image: input.image ?? '/placeholder.png',
      price: Number(input.price) || 0,
      quantity: Math.max(1, Number(input.quantity ?? 1)),
    };

    setCart((curr) => {
      const idx = curr.findIndex((it) => it._id === item._id);
      if (idx >= 0) {
        const next = [...curr];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + item.quantity,
        };
        return next;
      }
      return [...curr, item];
    });

    // 🔔 Tracking GA (value désormais optionnelle dans lib/ga.ts → pas d’erreurs TS)
    event({
      action: 'add_to_cart',
      category: 'ecommerce',
      label: item.title,
      value: item.price * item.quantity,
    });

    // Helper GA4 e-commerce (items formatés)
    trackAddToCart({
      currency: 'EUR',
      value: item.price * item.quantity,
      items: [
        {
          item_id: item._id,
          item_name: item.title,
          price: item.price,
          quantity: item.quantity,
        },
      ],
    });
  };

  const removeFromCart = (id: string) => {
    setCart((curr) => curr.filter((it) => it._id !== id));
    event({
      action: 'remove_from_cart',
      category: 'ecommerce',
      label: id,
      value: 0,
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity < 1) return;
    setCart((curr) =>
      curr.map((it) => (it._id === id ? { ...it, quantity } : it))
    );
    event({
      action: 'update_cart_quantity',
      category: 'ecommerce',
      label: id,
      value: quantity,
    });
  };

  const clearCart = () => {
    setCart([]);
    event({
      action: 'clear_cart',
      category: 'ecommerce',
      label: 'all',
      value: 0,
    });
  };

  const value: CartContextValue = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    count,
    total,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider />');
  }
  return ctx;
}
