// src/app/[locale]/layout.tsx
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  NextIntlClientProvider,
  type AbstractIntlMessages
} from 'next-intl'

import loadMessages from '@/i18n/loadMessages'
import { locales, isLocale, type Locale } from '@/i18n/config'

/** Pré-génère les segments /fr et /en (ISR/SSG friendly) */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

/** Ajuste l'OpenGraph locale par langue (safe au niveau layout).
 *  ⚠️ On NE met PAS de canonical/hreflang ici (sinon ça s'applique à toutes les pages du segment).
 */
export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const loc = isLocale(params.locale) ? (params.locale as Locale) : ('fr' as Locale)
  const ogLocale = loc === 'fr' ? 'fr_FR' : 'en_US'
  return {
    openGraph: { locale: ogLocale },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { locale: string }
}) {
  const locale = params.locale

  // 404 si locale inconnue
  if (!isLocale(locale)) notFound()

  // Messages typés pour NextIntl
  const messages = (await loadMessages(locale)) as AbstractIntlMessages

  return (
    <NextIntlClientProvider
      locale={locale as Locale}
      messages={messages}
    >
      {children}
    </NextIntlClientProvider>
  )
}
