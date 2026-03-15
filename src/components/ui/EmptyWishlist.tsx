'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'

import Link from '@/components/LocalizedLink'

export default function EmptyWishlist() {
  const t = useTranslations('wishlist')
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
      className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-14 text-center shadow-[var(--shadow-sm)]"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </div>
      <p className="text-[15px] font-medium text-[hsl(var(--text))]">{t('empty')}</p>
      <Link
        href="/products"
        className="btn-premium mt-6 inline-flex min-h-[2.75rem] items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
      >
        {t('cta_products')}
      </Link>
    </motion.div>
  )
}
