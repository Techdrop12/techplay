import type { CartItem as ProductCartItem } from '@/types/product';

export type CartItem = ProductCartItem;
export type Currency = 'EUR' | 'GBP' | 'USD';

export const STORAGE_KEY = 'cart';
export const COUPON_KEY = 'cart_coupon_v1';
export const CART_ID_KEY = 'cart_id';
export const CURRENCY_KEY = 'cart_currency_v1';

export const MIN_QTY = 1;
export const MAX_QTY = 99;

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const round2 = (n: number) => Math.round(n * 100) / 100;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isCurrency(value: unknown): value is Currency {
  return value === 'EUR' || value === 'GBP' || value === 'USD';
}

export function isExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  const ts = Date.parse(expiresAt);
  return Number.isFinite(ts) ? Date.now() > ts : false;
}

export function ensureItemShape(input: Partial<CartItem> | unknown): CartItem {
  const source = isRecord(input) ? input : {};

  return {
    _id: String(source._id ?? ''),
    slug: String(source.slug ?? ''),
    title: String(source.title ?? 'Produit'),
    image: String(source.image ?? '/og-image.jpg'),
    price: Number.isFinite(Number(source.price)) ? Number(source.price) : 0,
    quantity: clamp(Math.trunc(Number(source.quantity ?? 1)), MIN_QTY, MAX_QTY),
    sku: source.sku ? String(source.sku) : undefined,
  };
}

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : [];

    return items
      .filter(Boolean)
      .map((item: unknown) => ensureItemShape(item))
      .filter((item: CartItem) => Boolean(item._id && item.slug));
  } catch {
    return [];
  }
}

export function writeCart(cart: CartItem[]) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 2, items: cart }));
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
  } catch {
    // no-op
  }
}

export type Coupon =
  | { code: string; type: 'percent'; value: number; freeShipping?: boolean; expiresAt?: string }
  | { code: string; type: 'fixed'; value: number; freeShipping?: boolean; expiresAt?: string };

export function readCoupon(): Coupon | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(COUPON_KEY);
    if (!raw) return null;

    const coupon = JSON.parse(raw) as Coupon;
    if (!coupon?.code || isExpired(coupon.expiresAt)) return null;

    return coupon;
  } catch {
    return null;
  }
}

export function writeCoupon(coupon: Coupon | null) {
  if (typeof window === 'undefined') return;

  try {
    if (coupon) localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
    else localStorage.removeItem(COUPON_KEY);
  } catch {
    // no-op
  }
}

export function readCurrency(): Currency {
  if (typeof window === 'undefined') return 'EUR';

  try {
    const saved = localStorage.getItem(CURRENCY_KEY);
    return isCurrency(saved) ? saved : 'EUR';
  } catch {
    return 'EUR';
  }
}

export function writeCurrency(currency: Currency) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CURRENCY_KEY, currency);
  } catch {
    // no-op
  }
}

export function getOrCreateCartId(): string {
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
