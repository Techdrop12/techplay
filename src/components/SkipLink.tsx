'use client'

import { useTranslations } from 'next-intl'

export default function SkipLink() {
  const t = useTranslations('aria')
  const label = t('skip_to_content')

  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[hsl(var(--accent))] focus:px-4 focus:py-2 focus:text-[hsl(var(--accent-fg))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:transition-all focus:duration-200"
    >
      {label}
    </a>
  )
}
