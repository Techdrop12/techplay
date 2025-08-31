// src/app/[locale]/layout.tsx
import type { ReactNode } from 'react'
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
