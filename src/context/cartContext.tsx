// src/context/cartContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { event as gaEvent, trackAddToCart } from '@/lib/ga';
import {
  createCheckoutSessionFromCart,
  type CheckoutResponse,
} from '@/lib/checkout';

/** ----------------------- Constantes & env ----------------------- */
const STORAGE_KEY = 'cart';
const COUPON_KEY = 'cart_coupon_v1';
const CART_ID_KEY = 'cart_id';
const CURRENCY_KEY = 'cart_currency_v1';

const MIN_QTY = 1;
const MAX_QTY = 99;

const FREE_SHIPPING_THRESHOLD = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 60);
const FLAT_SHIPPING_FEE = Number(process.env.NEXT_PUBLIC_FLAT_SHIPPING_FEE ?? 0);
const TAX_RATE = Number(process.env.NEXT_PUBLIC_TAX_RATE ?? 0); // ex: 0.2 (20%)

/** ----------------------- Types ----------------------- */
export type Currency = 'EUR' | 'GBP' | 'USD';

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
  /** Items & identité de panier */
  cart: CartItem[];
  items: CartItem[];
  cartId: string;

  /** Devise (persistée LS + auto-détectée) */
  currency: Currency;
  setCurrency: (c: Currency) => void;

  /** Actions items */
  addToCart: (item: CartInput) => void | Promise<void>;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  increment: (id: string, step?: number) => void;
  decrement: (id: string, step?: number) => void;
  clearCart: () => void;
  replaceCart: (items: CartItem[]) => void;

  /** Coupon */
  coupon?: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;

  /** Sélecteurs */
  count: number;
  total: number; // sous-total (pré-remises & hors taxes)
  isInCart: (id: string) => boolean;
  getItemQuantity: (id: string) => number;
  getItem: (id: string) => CartItem | undefined;
  getLineTotal: (id: string) => number;

  /** Totaux calculés */
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  progressToFreeShipping: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;

  /** Réseau (pratique pour UI) */
  isOnline: boolean;

  /** Helper express checkout côté panier */
  beginCheckout: (args: { email: string; address: string; locale?: string }) => Promise<CheckoutResponse>;
}

/** ----------------------- Utils internes ----------------------- */
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const round2 = (n: number) => Math.round(n * 100) / 100;

const ensureItemShape = (it: Partial<CartItem>): CartItem => ([
  '_id','slug','title','image','price','quantity'
] as const).reduce((acc, key) => {
  (acc as any)[key] = key === 'price'
    ? (Number.isFinite(Number((it as any)[key])) ? Number((it as any)[key]) : 0)
    : key === 'quantity'
      ? clamp(Math.trunc(Number((it as any)[key] ?? 1)), MIN_QTY, MAX_QTY)
      : String((it as any)[key] ?? (key === 'title' ? 'Produit' : ''));
  return acc;
}, { sku: it.sku ? String(it.sku) : undefined } as CartItem);

/** Devise auto (EUR/GBP/USD) — robuste & SSR-safe */
function detectCurrency(): Currency {
  try {
    const htmlLang = typeof document !== 'undefined' ? (document.documentElement.lang || '') : '';
    const nav = typeof navigator !== 'undefined' ? (navigator.language || '') : '';
    const src = (htmlLang || nav).toLowerCase();

    if (src.includes('gb') || src.endsWith('-uk') || src.includes('en-gb')) return 'GBP';
    if (src.includes('us') || src.includes('en-us')) return 'USD';
    if (src.startsWith('en')) return 'USD';
    return 'EUR';
  } catch {
    return 'EUR';
  }
}

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
  } catch {}
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

function readCurrency(): Currency {
  if (typeof window === 'undefined') return 'EUR';
  try {
    const saved = localStorage.getItem(CURRENCY_KEY) as Currency | null;
    return (saved as Currency) || detectCurrency();
  } catch {
    return detectCurrency();
  }
}
function writeCurrency(cur: Currency) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(CURRENCY_KEY, cur) } catch {}
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

/** ----------------------- Provider ----------------------- */
const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() =>
    typeof window !== 'undefined' ? readCart() : []
  );
  const [coupon, setCoupon] = useState<Coupon | null>(() =>
    typeof window !== 'undefined' ? readCoupon() : null
  );
  const [cartId, setCartId] = useState<string>('anon');
  const [currency, setCurrencyState] = useState<Currency>(() =>
    typeof window !== 'undefined' ? readCurrency() : 'EUR'
  );
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const hydrated = useRef(false);
  const writeTimer = useRef<number | null>(null);

  useEffect(() => {
    setCartId(getOrCreateCartId());
    hydrated.current = true;
  }, []);

  // Network state (utile UI + télémétrie silencieuse)
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Persistance (débouonçage léger)
  useEffect(() => {
    if (!hydrated.current) return;
    if (writeTimer.current) window.clearTimeout(writeTimer.current);
    writeTimer.current = window.setTimeout(() => writeCart(cart), 80);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  useEffect(() => {
    if (!hydrated.current) return;
    writeCoupon(coupon);
  }, [coupon]);

  // Sauvegarde devise
  useEffect(() => {
    if (!hydrated.current) return;
    writeCurrency(currency);
  }, [currency]);

  // Sync inter-onglets & events custom
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setCart(readCart());
      if (e.key === COUPON_KEY) setCoupon(readCoupon());
      if (e.key === CART_ID_KEY && e.newValue) setCartId(e.newValue);
      if (e.key === CURRENCY_KEY && e.newValue) setCurrencyState((e.newValue as Currency) || 'EUR');
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<CartItem[]>).detail;
      if (detail) setCart(detail.map(ensureItemShape));
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('cart-updated', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cart-updated', onCustom as EventListener);
    };
  }, []);

  /** ----------------------- Sélecteurs ----------------------- */
  const count = useMemo(() => cart.reduce((s, it) => s + (it.quantity || 0), 0), [cart]);

  const subtotal = useMemo(
    () => round2(cart.reduce((s, it) => s + (Number(it.price) || 0) * (it.quantity || 0), 0)),
    [cart]
  );

  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.type === 'percent') {
      const rateRaw = Number(coupon.value);
      const rate = rateRaw > 1 ? rateRaw / 100 : rateRaw; // 20 -> .20
      return round2(subtotal * clamp(rate, 0, 1));
    }
    return round2(Math.max(0, Math.min(subtotal, Number(coupon.value))));
  }, [coupon, subtotal]);

  const shipping = useMemo(() => {
    if (FREE_SHIPPING_THRESHOLD > 0 && subtotal - discount >= FREE_SHIPPING_THRESHOLD) return 0;
    if (coupon?.freeShipping) return 0;
    return FLAT_SHIPPING_FEE;
  }, [subtotal, discount, coupon]);

  const taxableBase = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);
  const tax = useMemo(() => round2(taxableBase * Math.max(0, TAX_RATE)), [taxableBase]);
  const grandTotal = useMemo(() => round2(taxableBase + tax + shipping), [taxableBase, tax, shipping]);

  const total = useMemo(() => round2(subtotal), [subtotal]);

  const amountToFreeShipping = useMemo(() => {
    if (FREE_SHIPPING_THRESHOLD <= 0) return 0;
    return Math.max(0, round2(FREE_SHIPPING_THRESHOLD - (subtotal - discount)));
  }, [subtotal, discount]);

  const progressToFreeShipping = useMemo(() => {
    if (FREE_SHIPPING_THRESHOLD <= 0) return 100;
    return clamp(Math.round(((subtotal - discount) / FREE_SHIPPING_THRESHOLD) * 100), 0, 100);
  }, [subtotal, discount]);

  const isInCart = useCallback((id: string) => cart.some((it) => it._id === id), [cart]);
  const getItemQuantity = useCallback(
    (id: string) => cart.find((it) => it._id === id)?.quantity || 0,
    [cart]
  );
  const getItem = useCallback((id: string) => cart.find((it) => it._id === id), [cart]);
  const getLineTotal = useCallback(
    (id: string) => {
      const it = getItem(id);
      const p = Number(it?.price ?? 0);
      const q = Number(it?.quantity ?? 0);
      return round2(p * q);
    },
    [getItem]
  );

  /** ----------------------- Actions ----------------------- */
  const addToCart: CartContextValue['addToCart'] = useCallback((input) => {
    const item = ensureItemShape({ ...input, quantity: input.quantity ?? 1 });

    setCart((curr) => {
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

    // Tracking (tolérant, devise propagée)
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
        currency,
        value: round2(item.price * item.quantity),
        items: [
          {
            item_id: item._id,
            item_name: item.title,
            price: item.price,
            quantity: item.quantity,
          },
        ],
      });
    } catch {}
  }, [currency]);

  const removeFromCart: CartContextValue['removeFromCart'] = useCallback((id) => {
    setCart((curr) => curr.filter((it) => it._id !== id));
    try {
      gaEvent?.({ action: 'remove_from_cart', category: 'ecommerce', label: id, value: 0 });
    } catch {}
  }, []);

  const updateQuantity: CartContextValue['updateQuantity'] = useCallback((id, quantity) => {
    if (!Number.isFinite(quantity)) return;
    const q = clamp(Math.trunc(quantity), MIN_QTY, MAX_QTY);
    setCart((curr) => curr.map((it) => (it._id === id ? { ...it, quantity: q } : it)));
    try {
      gaEvent?.({ action: 'update_cart_quantity', category: 'ecommerce', label: id, value: q });
    } catch {}
  }, []);

  const increment: CartContextValue['increment'] = useCallback((id, step = 1) => {
    setCart((curr) =>
      curr.map((it) =>
        it._id === id ? { ...it, quantity: clamp(it.quantity + step, MIN_QTY, MAX_QTY) } : it
      )
    );
  }, []);

  const decrement: CartContextValue['decrement'] = useCallback((id, step = 1) => {
    setCart((curr) =>
      curr.map((it) =>
        it._id === id ? { ...it, quantity: clamp(it.quantity - step, MIN_QTY, MAX_QTY) } : it
      )
    );
  }, []);

  const clearCart: CartContextValue['clearCart'] = useCallback(() => {
    setCart([]);
    try {
      gaEvent?.({ action: 'clear_cart', category: 'ecommerce', label: 'all', value: 0 });
    } catch {}
  }, []);

  const replaceCart: CartContextValue['replaceCart'] = useCallback((items) => {
    setCart(items.map(ensureItemShape));
  }, []);

  const applyCoupon: CartContextValue['applyCoupon'] = useCallback((c) => setCoupon(c), []);
  const removeCoupon: CartContextValue['removeCoupon'] = useCallback(() => setCoupon(null), []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    // pas de conversion des montants ici : on affiche seulement dans la devise sélectionnée.
    // (si besoin, on branchera un FX service plus tard)
  }, []);

  /** ----------------------- Express checkout helper ----------------------- */
  const beginCheckout: CartContextValue['beginCheckout'] = useCallback(async ({ email, address, locale }) => {
    // Utilise le builder central pour transformer le panier en line items
    return createCheckoutSessionFromCart({
      email,
      address,
      cart,
      currency,
      locale,
      metadata: { cart_id: cartId },
    });
  }, [cart, currency, cartId]);

  /** ----------------------- Valeur contexte ----------------------- */
  const value: CartContextValue = useMemo(
    () => ({
      cart,
      items: cart,
      cartId,

      currency,
      setCurrency,

      addToCart,
      removeFromCart,
      updateQuantity,
      increment,
      decrement,
      clearCart,
      replaceCart,

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

      isOnline,

      beginCheckout,
    }),
    [
      cart,
      cartId,
      currency,
      setCurrency,
      addToCart,
      removeFromCart,
      updateQuantity,
      increment,
      decrement,
      clearCart,
      replaceCart,
      coupon,
      applyCoupon,
      removeCoupon,
      count,
      total,
      isInCart,
      getItemQuantity,
      getItem,
      getLineTotal,
      amountToFreeShipping,
      progressToFreeShipping,
      discount,
      shipping,
      tax,
      grandTotal,
      isOnline,
      beginCheckout,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** ----------------------- Hook ----------------------- */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider />');
  return ctx;
}
