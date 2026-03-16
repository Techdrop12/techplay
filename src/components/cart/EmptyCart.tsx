'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import Link from '@/components/LocalizedLink';

interface EmptyCartProps {
  locale?: 'fr' | 'en';
}

export default function EmptyCart({ locale: _locale }: EmptyCartProps) {
  const t = useTranslations('cart');
  const prefersReducedMotion = useReducedMotion();
  const message = t('empty');
  const sub = t('empty_sub');
  const cta = t('view_products');
  const ctaPacks = t('view_packs');

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      role="status"
      aria-live="polite"
      aria-label={message}
      className="overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-16 text-center shadow-[var(--shadow-sm)]"
    >
      <div
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(var(--surface-2))] text-token-text/50"
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          className="h-10 w-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      </div>
      <h2 className="heading-section">{message}</h2>
      <p className="mx-auto mt-2 max-w-sm text-[14px] text-token-text/75">{sub}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/products"
          className="btn-premium inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]"
        >
          {cta}
        </Link>
        <Link
          href="/products/packs"
          className="btn-outline inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
        >
          {ctaPacks}
        </Link>
      </div>
    </motion.div>
  );
}
