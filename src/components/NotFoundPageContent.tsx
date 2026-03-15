'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Suspense } from 'react'
import { useTranslations } from 'next-intl'

import BackToHomeLink from '@/components/BackToHomeLink'
import Link from '@/components/LocalizedLink'
import NotFoundClient from '@/components/NotFound'

export default function NotFoundPageContent() {
  const t = useTranslations('not_found')
  const tCommon = useTranslations('common')
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
      className="text-center"
    >
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(var(--surface-2))] text-token-text/50" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <h1 id="nf-title" className="heading-page sm:text-4xl">
        {t('title')}
      </h1>
      <p className="mt-4 text-[15px] text-token-text/75">{t('message')}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <BackToHomeLink className="focus-visible:ring-offset-2" />
        <Link
          href="/products"
          className="btn-outline inline-flex min-h-[48px] items-center justify-center rounded-full px-5 py-2.5 text-[15px] font-semibold focus-visible:ring-offset-2"
        >
          {t('link_products')}
        </Link>
        <Link
          href="/contact"
          className="btn-ghost inline-flex min-h-[48px] items-center justify-center rounded-full px-5 py-2.5 text-[15px] font-semibold focus-visible:ring-offset-2"
        >
          {t('link_contact')}
        </Link>
      </div>
      <Suspense fallback={<p className="mt-10 text-[13px] text-token-text/60">{tCommon('loading')}</p>}>
        <NotFoundClient />
      </Suspense>
    </motion.div>
  )
}
