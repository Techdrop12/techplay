'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';

import type { Product } from '@/types/product';

import CartList from '@/components/cart/CartList';
import CartSummary from '@/components/cart/CartSummary';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import FreeShippingBadge from '@/components/FreeShippingBadge';
import Link from '@/components/LocalizedLink';
import { useCart } from '@/hooks/useCart';
import { detectCurrency } from '@/lib/currency';
import { mapProductToGaItem, pushDataLayer, trackBeginCheckout } from '@/lib/ga';
import { formatPrice } from '@/lib/utils';

type CheckoutItem = Product & { quantity: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(record: Record<string, unknown>, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

function readNumber(record: Record<string, unknown>, keys: readonly string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    const parsed =
      typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim()
          ? Number(value)
          : NaN;

    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function normalizeCartItem(value: unknown): CheckoutItem | null {
  if (!isRecord(value)) return null;

  const slug = readString(value, ['slug']) ?? readString(value, ['_id', 'id']);
  const id = readString(value, ['_id', 'id', 'slug']) ?? slug;
  const price = readNumber(value, ['price']);
  const quantity = Math.max(1, readNumber(value, ['quantity', 'qty']) ?? 1);

  if (!slug || !id || typeof price !== 'number') return null;

  return {
    _id: id,
    slug,
    price,
    quantity,
    title: readString(value, ['title', 'name']),
    image: readString(value, ['image']),
    description: readString(value, ['description']),
    category: readString(value, ['category']),
    brand: readString(value, ['brand']),
    sku: readString(value, ['sku']),
    stock: readNumber(value, ['stock']),
    rating: readNumber(value, ['rating']),
    reviewsCount: readNumber(value, ['reviewsCount']),
    oldPrice: readNumber(value, ['oldPrice', 'compareAtPrice']),
  };
}

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tMisc = useTranslations('misc');
  const { cart } = useCart();
  const hasFiredRef = useRef(false);

  const { items, itemsCount, subtotal, gaItems, currency } = useMemo(() => {
    const normalizedItems = (Array.isArray(cart) ? cart : [])
      .map(normalizeCartItem)
      .filter((item): item is CheckoutItem => item !== null);

    const totalItems = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalSubtotal = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const analyticsItems = normalizedItems.map((item) => {
      const source: Record<string, unknown> = {
        _id: item._id,
        slug: item.slug,
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category,
        brand: item.brand,
        sku: item.sku,
        quantity: item.quantity,
      };

      return mapProductToGaItem(source);
    });

    return {
      items: normalizedItems,
      itemsCount: totalItems,
      subtotal: totalSubtotal,
      gaItems: analyticsItems,
      currency: detectCurrency(),
    };
  }, [cart]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (items.length === 0 || hasFiredRef.current) return;
    hasFiredRef.current = true;

    try {
      trackBeginCheckout({
        currency,
        value: subtotal,
        items: gaItems,
      });
    } catch {}

    try {
      pushDataLayer({
        event: 'begin_checkout',
        currency,
        value: subtotal,
        ecommerce: {
          currency,
          value: subtotal,
          items: gaItems,
        },
      });
    } catch {}
  }, [items.length, subtotal, currency, gaItems]);

  const isEmpty = items.length === 0;

  return (
    <main
      className="container-app mx-auto max-w-6xl pt-24 pb-24 sm:pt-28 sm:pb-24"
      aria-labelledby="checkout-title"
      role="main"
    >
      <nav aria-label={tMisc('breadcrumb_aria')} className="mb-6 text-[12px] text-token-text/60">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              href="/"
              className="transition hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
            >
              {t('breadcrumb_home')}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-token-text/90">
            {t('breadcrumb_order')}
          </li>
        </ol>
      </nav>

      <h1 id="checkout-title" className="heading-page">
        {t('page_title')}
      </h1>
      <p className="mt-1 text-[13px] text-token-text/70">
        {t('items_step', { count: itemsCount })}
      </p>

      {!isEmpty && (
        <div className="mt-4">
          <FreeShippingBadge price={subtotal} withProgress />
        </div>
      )}

      {isEmpty ? (
        <section
          className="mt-12 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/50 py-12 text-center"
          role="alert"
          aria-live="polite"
        >
          <p className="mb-6 text-lg text-token-text/70">{t('cart_empty')}</p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-6 py-2.5 text-sm font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-lg)] transition hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]"
            >
              {t('browse_products')}
            </Link>

            <Link
              href="/products/packs"
              className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-6 py-2.5 text-sm font-medium text-token-text transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            >
              {t('view_packs')}
            </Link>
          </div>
        </section>
      ) : (
        <>
          <div
            className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr,minmax(360px,420px)] lg:gap-10"
            aria-live="polite"
          >
            <section className="min-w-0 space-y-6 lg:col-span-1" aria-label={t('cart_aria')}>
              <CartList items={items} />
            </section>

            <aside
              id="paiement"
              className="sticky top-24 h-fit space-y-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-[var(--shadow-md)] sm:p-6 scroll-mt-28"
              aria-label={t('summary_aria')}
            >
              <CartSummary items={items} />
              <CheckoutForm />
              <div className="rounded-lg border border-[hsl(var(--border))]/70 bg-[hsl(var(--surface-2))]/80 px-3.5 py-2.5 text-[11px] text-token-text/70">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5z" />
                      <path d="M10 11V7a2 2 0 1 1 4 0v4" />
                    </svg>
                  </span>
                  <p className="font-medium text-[hsl(var(--text))]">{t('secure_note')}</p>
                </div>
              </div>
            </aside>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden pb-[env(safe-area-inset-bottom)]">
            <div className="mx-4 mb-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-[var(--shadow-lg)]">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[12px] text-token-text/70">{t('total')}</p>
                  <p className="text-base font-bold tabular-nums text-[hsl(var(--text))] truncate">
                    {formatPrice(subtotal, { currency })}
                  </p>
                </div>
                <a
                  href="#paiement"
                  className="touch-target shrink-0 inline-flex min-h-[2.75rem] items-center justify-center rounded-xl bg-[hsl(var(--accent))] px-6 py-3 text-[15px] font-bold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)] transition hover:opacity-95 active:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
                  aria-label={t('continue_to_payment_aria')}
                >
                  {t('continue_btn')}
                </a>
              </div>
            </div>
            <div className="h-20" aria-hidden="true" />
          </div>
        </>
      )}
    </main>
  );
}
