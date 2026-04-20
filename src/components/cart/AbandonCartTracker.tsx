'use client';

import { useEffect, useMemo, useRef } from 'react';

import type { Product } from '@/types/product';

import { sendAbandonCartReminder } from '@/lib/abandon-cart';
import { BUSINESS_EVENTS } from '@/lib/analytics-events';
import { pushDataLayer } from '@/lib/ga';
import { error as logError } from '@/lib/logger';

type ReminderCart = Parameters<typeof sendAbandonCartReminder>[1];
type ReminderCartItem = ReminderCart extends ReadonlyArray<infer T> ? T : never;

type CartProduct = Product & {
  quantity?: number;
  _id?: string;
  id?: string;
  sku?: string;
  image?: string;
  title?: string;
  price?: number;
  slug?: string;
};

interface AbandonCartTrackerProps {
  email: string;
  cart: CartProduct[];
  delayMs?: number;
  minItems?: number;
  minTotal?: number;
}

const ENV_DELAY = Number.parseInt(process.env.NEXT_PUBLIC_ABANDON_DELAY_MS ?? '', 10);
const DEFAULT_DELAY = Number.isFinite(ENV_DELAY)
  ? ENV_DELAY
  : process.env.NODE_ENV === 'development'
    ? 90_000
    : 30 * 60_000;

const MIN_DELAY_MS = 10_000;

function toSafeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function toSafePrice(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function toSafeQuantity(value: unknown): number {
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export default function AbandonCartTracker({
  email,
  cart,
  delayMs,
  minItems = 1,
  minTotal = 0,
}: AbandonCartTrackerProps) {
  const cleanEmail = email.trim();
  const delay = Math.max(MIN_DELAY_MS, delayMs ?? DEFAULT_DELAY);

  const lastSentKeyRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { normalized, total, signature } = useMemo(() => {
    const items: ReminderCartItem[] = Array.isArray(cart)
      ? cart.map((product, index) => {
          const id = String(
            product._id ?? product.id ?? product.sku ?? product.slug ?? `cart-item-${index}`
          );

          const title = toSafeString(product.title, 'Produit');
          const price = toSafePrice(product.price);
          const quantity = toSafeQuantity(product.quantity);
          const image = toSafeString(product.image, '/fallback.png');

          return {
            id,
            title,
            price,
            quantity,
            image,
          } as ReminderCartItem;
        })
      : [];

    const cartTotal = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    const stableSignature = JSON.stringify(
      items
        .map((item) => `${String(item.id)}:${Number(item.quantity)}:${Number(item.price)}`)
        .sort((a, b) => a.localeCompare(b))
    );

    return {
      normalized: items,
      total: cartTotal,
      signature: stableSignature,
    };
  }, [cart]);

  useEffect(() => {
    const canRun = cleanEmail.length > 0 && normalized.length >= minItems && total >= minTotal;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!canRun) return;

    const sentKey = `${cleanEmail}::${signature}`;
    if (lastSentKeyRef.current === sentKey) return;

    try {
      pushDataLayer({
        event: BUSINESS_EVENTS.CART_ABANDON_ELIGIBLE,
        value: total,
        item_count: normalized.length,
        items: normalized.map((item) => ({
          item_id: String(item.id),
          item_name: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
        currency: 'EUR',
      });
    } catch {
      // no-op
    }

    timerRef.current = setTimeout(async () => {
      try {
        await sendAbandonCartReminder(cleanEmail, normalized);
        lastSentKeyRef.current = sentKey;
      } catch (error) {
        logError('[AbandonCartTracker] Failed to send reminder:', error);
      }
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [cleanEmail, normalized, signature, total, minItems, minTotal, delay]);

  return null;
}
