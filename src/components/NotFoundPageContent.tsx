'use client'

import { Suspense } from 'react'

import { useTranslations } from 'next-intl'

import BackToHomeLink from '@/components/BackToHomeLink'
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
      <div className="mt-8">
        <BackToHomeLink className="focus-visible:ring-offset-2" />
      </div>
      <Suspense fallback={<p className="mt-10 text-[13px] text-token-text/60">{tCommon('loading')}</p>}>
        <NotFoundClient />
      </Suspense>
    </>
  )
}
