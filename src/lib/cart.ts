// src/lib/cart.ts — Lecture/écriture panier (localStorage), type depuis @/types/product

import type { CartItem } from '@/types/product';

import { warn } from '@/lib/logger';

export const STORAGE_KEY = 'cart';

export type { CartItem };

export type CartInput = Omit<CartItem, 'quantity'> & { quantity?: number };

const isBrowser = typeof window !== 'undefined';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sanitizeItem(input: unknown): CartItem | null {
  if (!isRecord(input)) return null;

  const _id = String(input._id ?? '');
  const slug = String(input.slug ?? '');
  if (!_id || !slug) return null;

  const title = String(input.title ?? 'Produit');
  const image = String(input.image ?? '/placeholder.png');
  const price = Number(input.price);
  const quantity = Math.max(1, Number(input.quantity ?? 1));

  if (!Number.isFinite(price)) return null;

  return {
    _id,
    slug,
    title,
    image,
    price,
    quantity,
  };
}

function parseCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(sanitizeItem).filter((item): item is CartItem => Boolean(item));
}

export function getCart(): CartItem[] {
  if (!isBrowser) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) return parseCart(parsed);
    if (Array.isArray(parsed?.items)) return parseCart(parsed.items);

    return [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  if (!isBrowser) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 2, items: cart }));
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
  } catch {
    warn('[cart] unable to persist cart');
  }
}

export const cartCount = (cart: CartItem[]) =>
  (cart || []).reduce((sum, item) => sum + Math.max(1, Number(item.quantity || 1)), 0);

export const cartTotal = (cart: CartItem[]) =>
  (cart || []).reduce(
    (sum, item) => sum + (Number(item.price) || 0) * Math.max(1, Number(item.quantity || 1)),
    0
  );

export function addItem(cart: CartItem[], input: CartInput): CartItem[] {
  const item = sanitizeItem({ ...input, quantity: Math.max(1, Number(input.quantity ?? 1)) });
  if (!item) return cart;

  const idx = cart.findIndex((it) => it._id === item._id);
  if (idx >= 0) {
    const next = [...cart];
    next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
    return next;
  }

  return [...cart, item];
}

export function updateQuantity(cart: CartItem[], id: string, quantity: number): CartItem[] {
  const q = Math.max(1, Number(quantity || 1));
  return cart.map((item) => (item._id === id ? { ...item, quantity: q } : item));
}

export function removeItem(cart: CartItem[], id: string): CartItem[] {
  return cart.filter((item) => item._id !== id);
}

export function clearCart(): CartItem[] {
  return [];
}

export const isInCart = (cart: CartItem[], id: string) => cart.some((item) => item._id === id);

export const getItemQuantity = (cart: CartItem[], id: string) =>
  cart.find((item) => item._id === id)?.quantity || 0;

export function subscribeToCart(cb: (cart: CartItem[]) => void): () => void {
  if (!isBrowser) return () => {};

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb(getCart());
  };

  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent<CartItem[]>).detail;
    if (Array.isArray(detail)) cb(detail);
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener('cart-updated', onCustom as EventListener);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('cart-updated', onCustom as EventListener);
  };
}
