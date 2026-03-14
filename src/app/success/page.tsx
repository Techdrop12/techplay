'use client'

import { useTranslations } from 'next-intl'

import BackToHomeLink from '@/components/BackToHomeLink'
import Link from '@/components/LocalizedLink'

export default function SuccessPage() {
  const t = useTranslations('success_page')

  return (
    <main className="container-app flex min-h-screen flex-col items-center justify-center py-16" role="main" aria-labelledby="success-title">
      <div className="card w-full max-w-md p-8 text-center shadow-[var(--shadow-xl)] sm:p-10">
        <h1 id="success-title" className="heading-page text-[hsl(var(--accent))]">
          {t('title')}
        </h1>
        <p className="mt-3 text-[var(--step-0)] text-token-text/75">
          {t('thank_you')}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <BackToHomeLink className="focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]" />
          <Link href="/products" className="btn-outline inline-flex min-h-[48px] items-center justify-center rounded-full px-6 py-2.5 text-[15px] font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)]" prefetch={false}>
            {t('continue_shopping')}
          </Link>
        </div>
      </div>
    </main>
  )
}
