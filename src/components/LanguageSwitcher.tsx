// src/components/LanguageSwitcher.tsx
'use client'

import { usePathname, useRouter } from 'next/navigation'

import { event as gaEvent } from '@/lib/ga'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'
import {
  languages as SUPPORTED_LOCALES,
  localeLabels,
  type Locale,
  setLocaleCookie,
} from '@/lib/language'

export default function LanguageSwitcher() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const current = getCurrentLocale(pathname)

  const changeLanguage = (next: Locale) => {
    if (next === current) return

    try {
      setLocaleCookie(next)
    } catch {}

    try {
      gaEvent?.({ action: 'change_language', category: 'engagement', label: next })
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({ event: 'change_language', locale: next })
    } catch {}

    const href = localizePath(pathname, next, { keepQuery: true, keepHash: true })
    router.replace(href)
  }

  return (
    <div className="inline-flex gap-2" role="group" aria-label="Sélecteur de langue">
      {(SUPPORTED_LOCALES as readonly Locale[]).map((lang) => {
        const active = current === lang
        return (
          <button
            key={lang}
            type="button"
            onClick={() => changeLanguage(lang)}
            onMouseDown={(e) => e.preventDefault()}
            disabled={active}
            aria-pressed={active}
            aria-current={active ? 'true' : undefined}
            aria-label={`Changer la langue vers ${localeLabels[lang]}`}
            className={[
              'px-2 py-1 rounded text-sm transition outline-none focus:ring-2',
              active
                ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] cursor-default'
                : 'bg-[hsl(var(--surface-2))] text-[hsl(var(--text))] hover:opacity-90 focus:ring-[hsl(var(--accent))]',
            ].join(' ')}
            data-gtm="lang_switch"
            data-lang={lang}
          >
            {lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
          </button>
        )
      })}
    </div>
  )
}