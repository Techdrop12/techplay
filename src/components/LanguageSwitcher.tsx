// src/components/LanguageSwitcher.tsx
'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'

const SUPPORTED = ['fr', 'en'] as const
type Locale = (typeof SUPPORTED)[number]

function buildPathWithLocale(pathname: string, newLocale: Locale) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0 && SUPPORTED.includes(segments[0] as Locale)) {
    segments[0] = newLocale
  } else {
    segments.unshift(newLocale)
  }
  return '/' + segments.join('/')
}

export default function LanguageSwitcher() {
  const locale = (useLocale() as Locale) ?? 'fr'
  const pathname = usePathname() || '/'
  const router = useRouter()

  const changeLanguage = (newLocale: Locale) => {
    if (newLocale === locale) return
    const base = buildPathWithLocale(pathname, newLocale)
    const qs = typeof window !== 'undefined' ? window.location.search : ''
    router.replace(base + (qs || ''))
  }

  return (
    <div className="inline-flex gap-2" role="group" aria-label="Sélecteur de langue">
      {SUPPORTED.map((lang) => {
        const active = locale === lang
        return (
          <button
            key={lang}
            type="button"
            onClick={() => changeLanguage(lang)}
            disabled={active}
            aria-pressed={active}
            aria-label={`Changer la langue vers ${lang === 'fr' ? 'français' : 'anglais'}`}
            className={[
              'px-2 py-1 rounded text-sm transition outline-none focus:ring-2',
              active
                ? 'bg-blue-600 text-white cursor-default'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:opacity-90 focus:ring-blue-400',
            ].join(' ')}
          >
            {lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
          </button>
        )
      })}
    </div>
  )
}
