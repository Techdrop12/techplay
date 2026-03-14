'use client'

import { usePathname } from 'next/navigation'

const LABELS = {
  fr: 'Aller au contenu principal',
  en: 'Skip to main content',
} as const

export default function SkipLink() {
  const pathname = usePathname() ?? '/'
  const locale = pathname.startsWith('/en') ? 'en' : 'fr'
  const label = LABELS[locale]

  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[hsl(var(--accent))] focus:px-4 focus:py-2 focus:text-[hsl(var(--accent-fg))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
    >
      {label}
    </a>
  )
}
