'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import Link from '@/components/LocalizedLink';

export default function EmptyWishlist() {
  const t = useTranslations('wishlist');
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
      className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-16 text-center shadow-[var(--shadow-sm)]"
      role="status"
      aria-live="polite"
      aria-label={t('empty')}
    >
      <div
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]"
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
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </div>
      <h2 className="heading-section text-[1.125rem] font-semibold sm:text-lg">{t('empty')}</h2>
      <Link
        href="/products"
        className="btn-premium mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
      >
        {t('cta_products')}
      </Link>
    </motion.div>
  );
}
