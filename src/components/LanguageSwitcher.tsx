// src/components/LanguageSwitcher.tsx — polish mineur (anti-blur mousedown, dataLayer + cookie util)
'use client'

import { usePathname, useRouter } from 'next/navigation'

import { event as gaEvent } from '@/lib/ga'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'
import {
  languages as SUPPORTED_LOCALES,
  localeLabels,
  LOCALE_COOKIE,
  type Locale,
  setLocaleCookie,
} from '@/lib/language'

export default function LanguageSwitcher() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const current = getCurrentLocale(pathname)

  const changeLanguage = (next: Locale) => {
    if (next === current) return

    // 1) Persistance cookie (1 an) — une seule écriture via util
    try {
      setLocaleCookie(next)
      // double guard côté document.cookie (utile en cas d’environnement custom)
      const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(next)}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`
    } catch {}

    // 2) Tracking (GA4 + fallback GTM dataLayer)
    try {
      gaEvent?.({ action: 'change_language', category: 'engagement', label: next })
      ;(window as unknown).dataLayer = (window as unknown).dataLayer || []
      ;(window as unknown).dataLayer.push({ event: 'change_language', locale: next })
    } catch {}

    // 3) URL localisée + conservation query + hash
    const href = localizePath(pathname, next, { keepQuery: true, keepHash: true })

    // 4) Remplacer l’entrée (pas d’empilement d’historique)
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
            onMouseDown={(e) => e.preventDefault()} // évite le blur
            disabled={active}
            aria-pressed={active}
            aria-current={active ? 'true' : undefined}
            aria-label={`Changer la langue vers ${localeLabels[lang]}`}
            className={[
              'px-2 py-1 rounded text-sm transition outline-none focus:ring-2',
              active
                ? 'bg-blue-600 text-white cursor-default'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:opacity-90 focus:ring-blue-400',
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

