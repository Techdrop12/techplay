'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import BackToHomeLink from '@/components/BackToHomeLink'

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('login_error')
  const tCommon = useTranslations('common')

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error)
    }
  }, [error])

  return (
    <main className="mx-auto max-w-md px-4 py-10" role="main" aria-labelledby="login-error-title">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[var(--shadow-md)] sm:p-8">
        <h1 id="login-error-title" className="text-xl font-extrabold text-red-800 dark:text-red-300">
          {t('title')}
        </h1>
        <p className="mt-2 text-[15px] text-red-700 dark:text-red-400">
          {t('message')}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-md)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            {tCommon('retry')}
          </button>
          <BackToHomeLink variant="outline" />
        </div>
      </div>
    </main>
  )
}
