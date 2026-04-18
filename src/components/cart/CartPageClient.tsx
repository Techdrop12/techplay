// src/components/cart/CartPageClient.tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef } from 'react';

import type { Product } from '@/types/product';

import CartList from '@/components/cart/CartList';
import CartSummary from '@/components/cart/CartSummary';
import EmptyCart from '@/components/cart/EmptyCart';
import Link from '@/components/LocalizedLink';
import { useCart } from '@/hooks/useCart';
import { event as gaEvent, mapProductToGaItem, trackViewCart } from '@/lib/ga';

type CartProduct = Product & { quantity: number };

const CART_REASSURANCE = {
  fr: 'Livraison internationale · Paiement sécurisé · Retours gratuits 30 jours',
  en: 'International delivery · Secure payment · 30-day free returns',
} as const;

export default function CartPageClient() {
  const t = useTranslations('cart');
  const tNav = useTranslations('nav');
  const locale = useLocale() as 'fr' | 'en';
  const { cart } = useCart();
  const prefersReduced = useReducedMotion();
  const srRef = useRef<HTMLParagraphElement | null>(null);

  const safeCart = useMemo<CartProduct[]>(() => {
    return Array.isArray(cart) ? (cart as CartProduct[]) : [];
  }, [cart]);

  const isEmpty = safeCart.length === 0;

  const count = useMemo(
    () => safeCart.reduce((s, it) => s + (Number(it.quantity) || 0), 0),
    [safeCart]
  );

  const cartTotal = useMemo(
    () => safeCart.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0),
    [safeCart]
  );

  const prevCountRef = useRef<number>(0);

  useEffect(() => {
    if (!srRef.current) return;

    const prev = prevCountRef.current;
    let text = '';

    if (count === 0) text = t('cart_empty_sr');
    else if (prev === 0) text = t('items_in_cart_sr', { count });
    else if (count > prev) {
      const diff = count - prev;
      text = t('items_added_sr', { diff, count });
    } else if (count < prev) {
      const diff = prev - count;
      text = t('items_removed_sr', { diff, count });
    } else {
      text = t('items_in_cart_sr', { count });
    }

    srRef.current.textContent = text;
    prevCountRef.current = count;
  }, [count, t]);

  useEffect(() => {
    if (isEmpty) return;
    try {
      const value = Math.round(cartTotal * 100) / 100;
      gaEvent?.({
        action: 'view_cart',
        category: 'ecommerce',
        label: 'cart_page',
        value,
      });
      const items = safeCart.map((p) => ({
        ...mapProductToGaItem(p),
        quantity: Number(p.quantity) || 1,
      }));
      trackViewCart({ currency: 'EUR', value, items });
    } catch {}
  }, [isEmpty, cartTotal, safeCart]);

  return (
    <main
      className="container-app mx-auto max-w-6xl py-10 sm:py-12"
      role="main"
      aria-labelledby="cart-title"
    >
      <nav aria-label={t('breadcrumb_aria')} className="mb-8 text-[13px] text-token-text/60">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              href="/"
              className="transition hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded"
            >
              {tNav('home')}
            </Link>
          </li>
          <li aria-hidden="true" className="text-token-text/40">
            /
          </li>
          <li aria-current="page" className="text-token-text/90">
            {tNav('cart')}
          </li>
        </ol>
      </nav>

      <p ref={srRef} className="sr-only" role="status" aria-live="polite" />

      <motion.h1
        id="cart-title"
        className="text-2xl font-extrabold tracking-tight text-[hsl(var(--text))] sm:text-3xl lg:text-[2rem]"
        initial={prefersReduced ? false : { opacity: 0, y: 6 }}
        animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {t('page_title')}
        {count > 0 ? ` · ${t('items_count', { count })}` : ''}
      </motion.h1>

      {!isEmpty ? (
        <p className="mt-2 text-[13px] text-token-text/70" role="doc-subtitle">
          {CART_REASSURANCE[locale === 'en' ? 'en' : 'fr']}
        </p>
      ) : null}

      {isEmpty ? (
        <motion.div
          className="mt-8"
          initial={prefersReduced ? false : { opacity: 0, y: 10 }}
          animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EmptyCart />
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              href="/products"
              className="touch-target inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-8 py-3.5 text-[15px] font-bold text-[hsl(var(--accent-fg))] shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]"
            >
              {t('explore_products')}
            </Link>
            <Link
              href="/products/packs"
              className="touch-target inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-8 py-3.5 text-[15px] font-semibold text-[hsl(var(--text))] transition hover:border-[hsl(var(--accent)/0.4)] hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            >
              {t('view_packs')}
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.section
          className="mt-8 grid gap-6 lg:grid-cols-[1fr,minmax(320px,400px)] lg:gap-10"
          aria-label={t('cart_content_aria')}
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={prefersReduced ? undefined : { opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <div className="min-w-0">
            <CartList items={safeCart} />
          </div>
          <div className="lg:sticky lg:top-6 lg:self-start">
            <CartSummary items={safeCart} />
          </div>
        </motion.section>
      )}
    </main>
  );
}
