'use client'

import { useTranslations } from 'next-intl'

interface ErrorFallbackProps {
  error: Error | unknown
}

export default function ErrorFallback({ error }: ErrorFallbackProps) {
  const t = useTranslations('error')
  return (
    <div role="alert" className="rounded border border-red-300 bg-red-100 p-4 text-red-700">
      <p>{t('fallback_message')}</p>
      <pre className="mt-2 text-xs">{error instanceof Error ? error.message : String(error)}</pre>
    </div>
  )
}
