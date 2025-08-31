// src/app/[locale]/layout.tsx
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales, isLocale, type Locale } from '@/i18n/config'

/** Prégénère / (fr = défaut sans préfixe) et /en */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

/** Ajuste l'OG locale (les canonicals/hreflang se gèrent page par page) */
export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const loc = isLocale(params.locale) ? (params.locale as Locale) : ('fr' as Locale)
  const ogLocale = loc === 'fr' ? 'fr_FR' : 'en_US'
  return { openGraph: { locale: ogLocale } }
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { locale: string }
}) {
  const locale = params.locale
  if (!isLocale(locale)) notFound()
  // Provider i18n désormais au RootLayout → pass-through
  return <>{children}</>
}
