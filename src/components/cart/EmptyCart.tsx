'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

import Link from '@/components/LocalizedLink'

interface EmptyCartProps {
  locale?: 'fr' | 'en'
}

export default function EmptyCart({ locale: _locale }: EmptyCartProps) {
  const t = useTranslations('cart')
  const message = t('empty')
  const sub = t('empty_sub')
  const cta = t('view_products')
  const ctaPacks = t('view_packs')

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      role="status"
      aria-live="polite"
      aria-label={message}
      className="card py-16 text-center shadow-[var(--shadow-lg)]"
    >
      <h2 className="heading-section">{message}</h2>
      <p className="mx-auto mt-2 max-w-sm text-[14px] text-token-text/75">{sub}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/products" className="btn-premium inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]">
          {cta}
        </Link>
        <Link href="/products/packs" className="btn-outline inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]" prefetch={false}>
          {ctaPacks}
        </Link>
      </div>
    </motion.div>
  )
}
