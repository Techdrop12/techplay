// src/components/LanguageSwitcher.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { event as gaEvent } from '@/lib/ga';
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing';
import { localeLabels, type Locale, setLocaleCookie } from '@/lib/language';

export default function LanguageSwitcher() {
  const t = useTranslations('common');
  const pathname = usePathname() || '/';
  const router = useRouter();
  const current = getCurrentLocale(pathname);

  const changeLanguage = (next: Locale) => {
    if (next === current) return;

    try {
      setLocaleCookie(next);
    } catch {}

    const href = localizePath(pathname, next, { keepQuery: true, keepHash: true });
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname;

    try {
      gaEvent?.({ action: 'change_language', category: 'engagement', label: next });
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'change_language', locale: next, from: current, to: next });
    } catch {}

    // For locale changes we prefer a full reload so that
    // all server-rendered messages pick up the new locale
    // consistently, even on non-[locale] routes.
    if (typeof window !== 'undefined') {
      // Avoid useless reloads if somehow already on the target URL
      if (href !== currentPath) {
        window.location.assign(href);
      } else {
        window.location.reload();
      }
      return;
    }

    // SSR / safety fallback
    router.replace(href);
  };

  const nextLocale: Locale = current === 'fr' ? 'en' : 'fr';
  const label = current === 'fr' ? 'FR' : 'EN';
  const switchAria = current === 'fr' ? t('change_lang_to', { lang: localeLabels.en }) : t('change_lang_to', { lang: localeLabels.fr });

  return (
    <button
      type="button"
      onClick={() => changeLanguage(nextLocale)}
      onMouseDown={(e) => e.preventDefault()}
      aria-label={switchAria}
      title={switchAria}
      className="min-w-[2.5rem] rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--text))] shadow-sm transition hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[hsl(var(--accent))]"
      data-gtm="lang_switch"
      data-lang={current}
    >
      {label}
    </button>
  );
}
