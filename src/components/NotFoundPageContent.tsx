'use client'

import { Suspense } from 'react'

import { useTranslations } from 'next-intl'

import BackToHomeLink from '@/components/BackToHomeLink'
import Link from '@/components/LocalizedLink'
import NotFoundClient from '@/components/NotFound'

export default function NotFoundPageContent() {
  const t = useTranslations('not_found')
  const tCommon = useTranslations('common')

  return (
    <>
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
    </>
  )
}
