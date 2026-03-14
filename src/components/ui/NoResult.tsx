'use client'

import { useTranslations } from 'next-intl'

export default function NoResult({ text }: { text?: string }) {
  const t = useTranslations('common')
  const displayText = text ?? t('no_result')
  return (
    <div
      className="text-center py-12 text-token-text/60 text-sm"
      role="status"
      aria-live="polite"
    >
      <p>😕 {displayText}</p>
    </div>
  )
}
