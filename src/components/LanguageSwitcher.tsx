// src/components/LanguageSwitcher.tsx
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { SUPPORTED_LOCALES, getCurrentLocale, localizePath, type Locale } from '@/lib/i18n-routing'

export default function LanguageSwitcher() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const locale = getCurrentLocale(pathname)

  const changeLanguage = (newLocale: Locale) => {
    if (newLocale === locale) return
    const next = localizePath(pathname, newLocale, { keepQuery: true })
    router.replace(next)
  }

  return (
    <div className="inline-flex gap-2" role="group" aria-label="Sélecteur de langue">
      {SUPPORTED_LOCALES.map((lang) => {
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
