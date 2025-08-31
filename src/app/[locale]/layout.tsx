// src/app/[locale]/layout.tsx
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl'

import loadMessages from '@/i18n/loadMessages'
import { locales, isLocale, type Locale } from '@/i18n/config'

/** Prégénère /fr et /en (utile tant qu’on n’a pas de middleware d’alias pour /) */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

/** Ajuste seulement l'OG locale; canonicals/hreflang se font page par page */
export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const loc = isLocale(params.locale) ? (params.locale as Locale) : ('fr' as Locale)
  const ogLocale = loc === 'fr' ? 'fr_FR' : 'en_US'
  return { openGraph: { locale: ogLocale } }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { locale: string }
}) {
  const locale = params.locale
  if (!isLocale(locale)) notFound()

  const messages = (await loadMessages(locale)) as AbstractIntlMessages

  return (
    <NextIntlClientProvider locale={locale as Locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
