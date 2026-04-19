'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { createCheckoutSessionFromCart, type CheckoutResponse } from '@/lib/checkout';
import {
  CART_ID_KEY,
  COUPON_KEY,
  CURRENCY_KEY,
  STORAGE_KEY,
  clamp,
  ensureItemShape,
  getOrCreateCartId,
  isExpired,
  isCurrency,
  readCart,
  readCoupon,
  readCurrency,
  round2,
  writeCart,
  writeCoupon,
  writeCurrency,
  type CartItem as CartItemHelper,
  type Coupon as CouponHelper,
} from '@/lib/cart-helpers';
import { UI } from '@/lib/constants';
import { detectCurrency } from '@/lib/currency';
import { event as gaEvent, trackAddToCart } from '@/lib/ga';

const MIN_QTY = 1;
const MAX_QTY = 99;

const FREE_SHIPPING_THRESHOLD = UI.FREE_SHIPPING_THRESHOLD;
const FLAT_SHIPPING_FEE = UI.FLAT_SHIPPING_FEE;
const TAX_RATE = UI.TAX_RATE;

export type Currency = 'EUR' | 'GBP' | 'USD';

/** Item du panier (source: @/types/product) */
export type CartItem = CartItemHelper;

export type CartInput = Omit<CartItem, 'quantity'> & { quantity?: number };

export type Coupon = CouponHelper;

export interface CartContextValue {
  cart: CartItem[];
  items: CartItem[];
  cartId: string;

  currency: Currency;
  setCurrency: (c: Currency) => void;

  addToCart: (item: CartInput) => void | Promise<void>;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  increment: (id: string, step?: number) => void;
  decrement: (id: string, step?: number) => void;
  clearCart: () => void;
  replaceCart: (items: CartItem[]) => void;

  coupon?: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;

  count: number;
  total: number;
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

  isOnline: boolean;

  beginCheckout: (args: {
    email: string;
    address: string;
    locale?: string;
  }) => Promise<CheckoutResponse>;
}


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
    setCart(readCart());
    setCoupon(readCoupon());
    setCurrencyState(readCurrency());
    setCartId(getOrCreateCartId());
    hydrated.current = true;
  }, []);

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

  useEffect(() => {
    if (!hydrated.current) return;

    if (writeTimer.current) window.clearTimeout(writeTimer.current);
    writeTimer.current = window.setTimeout(() => writeCart(cart), 500);

    return () => {
      if (writeTimer.current) window.clearTimeout(writeTimer.current);
    };
  }, [cart]);

  useEffect(() => {
    if (!hydrated.current) return;
    writeCoupon(coupon);
  }, [coupon]);

  useEffect(() => {
    if (!hydrated.current) return;
    writeCurrency(currency);
  }, [currency]);

  useEffect(() => {
    if (coupon && isExpired(coupon.expiresAt)) {
      setCoupon(null);
    }
  }, [coupon]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setCart(readCart());
      }

      if (e.key === COUPON_KEY) {
        setCoupon(readCoupon());
      }

      if (e.key === CART_ID_KEY && e.newValue) {
        setCartId(e.newValue);
      }

      if (e.key === CURRENCY_KEY && isCurrency(e.newValue)) {
        setCurrencyState(e.newValue);
      }
    };

    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const count = useMemo(() => cart.reduce((sum, item) => sum + (item.quantity || 0), 0), [cart]);

  const subtotal = useMemo(
    () =>
      round2(cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 0), 0)),
    [cart]
  );

  const discount = useMemo(() => {
    if (!coupon || isExpired(coupon.expiresAt)) return 0;

    if (coupon.type === 'percent') {
      const rawRate = Number(coupon.value);
      const rate = rawRate > 1 ? rawRate / 100 : rawRate;
      return round2(subtotal * clamp(rate, 0, 1));
    }

    return round2(Math.max(0, Math.min(subtotal, Number(coupon.value))));
  }, [coupon, subtotal]);

  const shipping = useMemo(() => {
    if (coupon?.freeShipping && !isExpired(coupon.expiresAt)) return 0;
    if (FREE_SHIPPING_THRESHOLD > 0 && subtotal - discount >= FREE_SHIPPING_THRESHOLD) return 0;
    return FLAT_SHIPPING_FEE;
  }, [coupon, discount, subtotal]);

  const taxableBase = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);
  const tax = useMemo(() => round2(taxableBase * Math.max(0, TAX_RATE)), [taxableBase]);
  const grandTotal = useMemo(
    () => round2(taxableBase + tax + shipping),
    [taxableBase, tax, shipping]
  );
  const total = useMemo(() => round2(subtotal), [subtotal]);

  const amountToFreeShipping = useMemo(() => {
    if (FREE_SHIPPING_THRESHOLD <= 0) return 0;
    return Math.max(0, round2(FREE_SHIPPING_THRESHOLD - (subtotal - discount)));
  }, [subtotal, discount]);

  const progressToFreeShipping = useMemo(() => {
    if (FREE_SHIPPING_THRESHOLD <= 0) return 100;
    return clamp(Math.round(((subtotal - discount) / FREE_SHIPPING_THRESHOLD) * 100), 0, 100);
  }, [subtotal, discount]);

  const isInCart = useCallback((id: string) => cart.some((item) => item._id === id), [cart]);

  const getItemQuantity = useCallback(
    (id: string) => cart.find((item) => item._id === id)?.quantity || 0,
    [cart]
  );

  const getItem = useCallback((id: string) => cart.find((item) => item._id === id), [cart]);

  const getLineTotal = useCallback(
    (id: string) => {
      const item = getItem(id);
      return round2(Number(item?.price ?? 0) * Number(item?.quantity ?? 0));
    },
    [getItem]
  );

  const addToCart: CartContextValue['addToCart'] = useCallback(
    (input) => {
      const item = ensureItemShape({ ...input, quantity: input.quantity ?? 1 });

      setCart((current) => {
        const existingIndex = current.findIndex((it) => it._id === item._id);

        if (existingIndex >= 0) {
          const next = [...current];
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: clamp(next[existingIndex].quantity + item.quantity, MIN_QTY, MAX_QTY),
          };
          return next;
        }

        return [...current, item];
      });

      try {
        gaEvent?.({
          action: 'add_to_cart',
          category: 'ecommerce',
          label: item.title,
          value: round2(item.price * item.quantity),
        });
      } catch {
        // no-op
      }

      try {
        trackAddToCart({
          currency,
          value: round2(item.price * item.quantity),
          items: [
            {
              item_id: item._id,
              item_name: item.title ?? '',
              price: item.price,
              quantity: item.quantity,
            },
          ],
        });
      } catch {
        // no-op
      }
    },
    [currency]
  );

  const removeFromCart = useCallback((id: string) => {
    setCart((current) => current.filter((item) => item._id !== id));

    try {
      gaEvent?.({
        action: 'remove_from_cart',
        category: 'ecommerce',
        label: id,
        value: 0,
      });
    } catch {
      // no-op
    }
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (!Number.isFinite(quantity)) return;

    const q = clamp(Math.trunc(quantity), MIN_QTY, MAX_QTY);

    setCart((current) =>
      current.map((item) => (item._id === id ? { ...item, quantity: q } : item))
    );

    try {
      gaEvent?.({
        action: 'update_cart_quantity',
        category: 'ecommerce',
        label: id,
        value: q,
      });
    } catch {
      // no-op
    }
  }, []);

  const increment = useCallback((id: string, step = 1) => {
    setCart((current) =>
      current.map((item) =>
        item._id === id
          ? { ...item, quantity: clamp(item.quantity + step, MIN_QTY, MAX_QTY) }
          : item
      )
    );
  }, []);

  const decrement = useCallback((id: string, step = 1) => {
    setCart((current) =>
      current.map((item) =>
        item._id === id
          ? { ...item, quantity: clamp(item.quantity - step, MIN_QTY, MAX_QTY) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);

    try {
      gaEvent?.({
        action: 'clear_cart',
        category: 'ecommerce',
        label: 'all',
        value: 0,
      });
    } catch {
      // no-op
    }
  }, []);

  const replaceCart = useCallback((items: CartItem[]) => {
    setCart(
      items.map((item) => ensureItemShape(item)).filter((item) => Boolean(item._id && item.slug))
    );
  }, []);

  const applyCoupon = useCallback((value: Coupon) => {
    if (!value?.code || isExpired(value.expiresAt)) {
      setCoupon(null);
      return;
    }
    setCoupon(value);
  }, []);

  const removeCoupon = useCallback(() => setCoupon(null), []);

  const setCurrency = useCallback((value: Currency) => {
    setCurrencyState(value);
  }, []);

  const beginCheckout: CartContextValue['beginCheckout'] = useCallback(
    async ({ email, address, locale }) => {
      if (!cart.length) {
        throw new Error('Le panier est vide.');
      }

      if (!isOnline) {
        throw new Error('Connexion internet indisponible.');
      }

      return createCheckoutSessionFromCart({
        email,
        address,
        cart,
        currency,
        locale,
        metadata: { cart_id: cartId },
      });
    },
    [cart, currency, cartId, isOnline]
  );

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

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside <CartProvider />');
  }
  return context;
}
