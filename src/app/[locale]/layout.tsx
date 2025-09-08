// src/app/[locale]/layout.tsx
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl'
import { unstable_setRequestLocale } from 'next-intl/server'

import loadMessages from '@/i18n/loadMessages'
import { locales, isLocale, type Locale } from '@/i18n/config'
import { toOgLocale } from '@/lib/language'

/** Prégénère /fr et /en (utile tant qu’on n’a pas de middleware d’alias pour /) */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

/** Ajuste seulement l'OG locale; canonicals/hreflang se font page par page */
export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const loc = isLocale(params.locale) ? (params.locale as Locale) : ('fr' as Locale)
  return { openGraph: { locale: toOgLocale(loc) } }
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

  // ✅ indique la locale au runtime côté serveur (next-intl RSC)
  unstable_setRequestLocale(locale as Locale)

  const messages = (await loadMessages(locale)) as AbstractIntlMessages

  return (
    <NextIntlClientProvider locale={locale as Locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
