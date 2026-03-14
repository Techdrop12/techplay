'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import BackToHomeLink from '@/components/BackToHomeLink'
import { getErrorMessage } from '@/lib/errors'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('error_page')
  const tCommon = useTranslations('common')

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[RootError]', error)
    }
  }, [error])

  const message = getErrorMessage(error)

  return (
    <main
      id="main"
      className="container-app mx-auto max-w-xl px-4 py-20 text-center"
      role="main"
      aria-labelledby="error-title"
    >
      <div className="card p-8 shadow-[var(--shadow-lg)]">
        <h1 id="error-title" className="text-xl font-bold text-token-text sm:text-2xl [letter-spacing:var(--heading-tracking)]">
          {t('title')}
        </h1>
        <p className="mt-2 text-[13px] text-token-text/70">{message}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-premium inline-flex min-h-[48px] items-center justify-center rounded-full px-6 py-2.5 text-[15px] font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] focus-visible:ring-offset-2"
          >
            {tCommon('retry')}
          </button>
          <BackToHomeLink variant="outline" prefetch={false} className="focus-visible:ring-4" />
        </div>
      </div>
    </main>
  )
}
