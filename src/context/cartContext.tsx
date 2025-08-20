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
import { event as gaEvent, trackAddToCart } from '@/lib/ga';

const STORAGE_KEY = 'cart';
const COUPON_KEY = 'cart_coupon_v1';
const CART_ID_KEY = 'cart_id';

const MIN_QTY = 1;
const MAX_QTY = 99;

const FREE_SHIPPING_THRESHOLD = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 60);
const FLAT_SHIPPING_FEE = Number(process.env.NEXT_PUBLIC_FLAT_SHIPPING_FEE ?? 0);
const TAX_RATE = Number(process.env.NEXT_PUBLIC_TAX_RATE ?? 0); // ex: 0.2

export type CartItem = {
  _id: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  sku?: string;
};

export type CartInput = Omit<CartItem, 'quantity'> & { quantity?: number };

export type Coupon =
  | { code: string; type: 'percent'; value: number; freeShipping?: boolean; expiresAt?: string }
  | { code: string; type: 'fixed'; value: number; freeShipping?: boolean; expiresAt?: string };

export interface CartContextValue {
  cart: CartItem[];
  cartId: string;

  addToCart: (item: CartInput) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  increment: (id: string, step?: number) => void;
  decrement: (id: string, step?: number) => void;
  clearCart: () => void;
  replaceCart: (items: CartItem[]) => void;
  /** Alias compat : setCart(items) = replaceCart(items) */
  // eslint-disable-next-line @typescript-eslint/ban-types
  setCart?: (items: CartItem[]) => void;

  coupon?: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;

  count: number;
  total: number; // sous-total (arrondi)
  isInCart: (id: string) => boolean;
  getItemQuantity: (id: string) => number;
  getItem: (id: string) => CartItem | undefined;
  getLineTotal: (id: string) => number;

  freeShippingThreshold: number;
  amountToFreeShipping: number;
  progressToFreeShipping: number;

  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

const ensureItemShape = (it: Partial<CartItem>): CartItem => ({
  _id: String(it._id ?? ''),
  slug: String(it.slug ?? ''),
  title: String(it.title ?? 'Produit'),
  image: String(it.image ?? '/placeholder.png'),
  price: Number(it.price ?? 0),
  quantity: clamp(Number(it.quantity ?? 1), MIN_QTY, MAX_QTY),
  sku: it.sku ? String(it.sku) : undefined,
});

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const arr: unknown[] = Array.isArray(parsed) ? parsed : parsed?.items ?? [];
    return (arr as any[]).filter(Boolean).map(ensureItemShape);
  } catch {
    return [];
  }
}

function writeCart(cart: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    const payload = { v: 2, items: cart };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
  } catch {
    // silencieux
  }
}

function readCoupon(): Coupon | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(COUPON_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Coupon;
    if (!c?.code) return null;
    if (c.expiresAt && Date.now() > Date.parse(c.expiresAt)) return null;
    return c;
  } catch {
    return null;
  }
}

function writeCoupon(coupon: Coupon | null) {
  if (typeof window === 'undefined') return;
  try {
    if (coupon) localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
    else localStorage.removeItem(COUPON_KEY);
  } catch {}
}

function getOrCreateCartId(): string {
  if (typeof window === 'undefined') return 'ssr';
  try {
    let id = localStorage.getItem(CART_ID_KEY);
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(CART_ID_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, _setCart] = useState<CartItem[]>(
    () => (typeof window !== 'undefined' ? readCart() : [])
  );
  const [coupon, setCoupon] = useState<Coupon | null>(
    () => (typeof window !== 'undefined' ? readCoupon() : null)
  );
  const [cartId, setCartId] = useState<string>('anon');

  const hydrated = useRef(false);

  type Timer = ReturnType<typeof setTimeout>;
  const writeTimer = useRef<Timer | null>(null);

  useEffect(() => {
    setCartId(getOrCreateCartId());
    hydrated.current = true;
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, []);

  // Persistance (idle si possible sinon debounce)
  useEffect(() => {
    if (!hydrated.current) return;

    const save = () => writeCart(cart);

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(save, { timeout: 120 });
    } else {
      if (writeTimer.current) clearTimeout(writeTimer.current);
      writeTimer.current = setTimeout(save, 80);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  // Persistance coupon
  useEffect(() => {
    if (!hydrated.current) return;
    writeCoupon(coupon);
  }, [coupon]);

  // Sync multi-onglets
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) _setCart(readCart());
      if (e.key === COUPON_KEY) setCoupon(readCoupon());
      if (e.key === CART_ID_KEY && e.newValue) setCartId(e.newValue);
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<CartItem[]>).detail;
      if (detail) _setCart(detail.map(ensureItemShape));
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('cart-updated', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cart-updated', onCustom as EventListener);
    };
  }, []);

  /* ============ Sélecteurs ============ */
  const count = useMemo(
    () => cart.reduce((s, it) => s + (it.quantity || 0), 0),
    [cart]
  );

  const subtotal = useMemo(
    () => round2(cart.reduce((s, it) => s + (Number(it.price) || 0) * (it.quantity || 0), 0)),
    [cart]
  );

  // ✅ Percent "10" (10%) ou "0.10" → normalisé en taux 0..1
  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.type === 'percent') {
      const rateRaw = coupon.value;
      const rate = clamp(rateRaw > 1 ? rateRaw / 100 : rateRaw, 0, 1);
      return round2(subtotal * rate);
    }
    return round2(Math.max(0, Math.min(subtotal, coupon.value)));
  }, [coupon, subtotal]);

  const shipping = useMemo(() => {
    if (FREE_SHIPPING_THRESHOLD > 0 && subtotal - discount >= FREE_SHIPPING_THRESHOLD) return 0;
    if (coupon?.freeShipping) return 0;
    return FLAT_SHIPPING_FEE;
  }, [subtotal, discount, coupon]);

  const taxableBase = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);
  const tax = useMemo(() => round2(taxableBase * Math.max(0, TAX_RATE)), [taxableBase]);
  const grandTotal = useMemo(() => round2(taxableBase + tax + shipping), [taxableBase, tax, shipping]);

  // compat : "total" = sous-total
  const total = subtotal;

  const amountToFreeShipping = useMemo(() => {
    if (FREE_SHIPPING_THRESHOLD <= 0) return 0;
    return Math.max(0, round2(FREE_SHIPPING_THRESHOLD - (subtotal - discount)));
  }, [subtotal, discount]);

  const progressToFreeShipping = useMemo(() => {
    if (FREE_SHIPPING_THRESHOLD <= 0) return 100;
    return clamp(Math.round(((subtotal - discount) / FREE_SHIPPING_THRESHOLD) * 100), 0, 100);
  }, [subtotal, discount]);

  const isInCart = (id: string) => cart.some((it) => it._id === id);
  const getItemQuantity = (id: string) => cart.find((it) => it._id === id)?.quantity || 0;
  const getItem = (id: string) => cart.find((it) => it._id === id);
  const getLineTotal = (id: string) => {
    const it = getItem(id);
    return it ? round2(it.price * it.quantity) : 0;
  };

  /* ============ Actions ============ */
  const addToCart = (input: CartInput) => {
    const item = ensureItemShape({ ...input, quantity: input.quantity ?? 1 });

    _setCart((curr) => {
      const idx = curr.findIndex((it) => it._id === item._id);
      if (idx >= 0) {
        const next = [...curr];
        next[idx] = {
          ...next[idx],
          quantity: clamp(next[idx].quantity + item.quantity, MIN_QTY, MAX_QTY),
        };
        return next;
      }
      return [...curr, item];
    });

    // Tracking (best-effort)
    try {
      gaEvent?.({
        action: 'add_to_cart',
        category: 'ecommerce',
        label: item.title,
        value: round2(item.price * item.quantity),
      });
    } catch {}
    try {
      trackAddToCart?.({
        currency: 'EUR',
        value: round2(item.price * item.quantity),
        items: [{ item_id: item._id, item_name: item.title, price: item.price, quantity: item.quantity }],
      });
    } catch {}
  };

  const removeFromCart = (id: string) => {
    _setCart((curr) => curr.filter((it) => it._id !== id));
    try {
      gaEvent?.({ action: 'remove_from_cart', category: 'ecommerce', label: id, value: 0 });
    } catch {}
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (!Number.isFinite(quantity)) return;
    const q = clamp(Math.trunc(quantity), MIN_QTY, MAX_QTY);
    _setCart((curr) => curr.map((it) => (it._id === id ? { ...it, quantity: q } : it)));
    try {
      gaEvent?.({ action: 'update_cart_quantity', category: 'ecommerce', label: id, value: q });
    } catch {}
  };

  const increment = (id: string, step: number = 1) => {
    _setCart((curr) =>
      curr.map((it) =>
        it._id === id ? { ...it, quantity: clamp(it.quantity + step, MIN_QTY, MAX_QTY) } : it
      )
    );
  };

  const decrement = (id: string, step: number = 1) => {
    _setCart((curr) =>
      curr.map((it) =>
        it._id === id ? { ...it, quantity: clamp(it.quantity - step, MIN_QTY, MAX_QTY) } : it
      )
    );
  };

  const clearCart = () => {
    _setCart([]);
    try {
      gaEvent?.({ action: 'clear_cart', category: 'ecommerce', label: 'all', value: 0 });
    } catch {}
  };

  const replaceCart = (items: CartItem[]) => {
    _setCart(items.map(ensureItemShape));
  };

  // Alias compat éventuelle (certains modules attendent setCart)
  const setCartAlias = (items: CartItem[]) => replaceCart(items);

  const applyCoupon = (c: Coupon) => setCoupon(c);
  const removeCoupon = () => setCoupon(null);

  const value: CartContextValue = {
    cart,
    cartId,

    addToCart,
    removeFromCart,
    updateQuantity,
    increment,
    decrement,
    clearCart,
    replaceCart,
    setCart: setCartAlias,

    coupon,
    applyCoupon,
    removeCoupon,

    count,
    total,
    isInCart,
    getItemQuantity,
    getItem,
    getLineTotal,

    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountToFreeShipping,
    progressToFreeShipping,

    discount,
    shipping,
    tax,
    grandTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider />');
  return ctx;
}
