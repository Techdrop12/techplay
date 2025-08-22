// src/app/[locale]/layout.tsx
import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl'
import loadMessages from '@/i18n/loadMessages'
import { isLocale, type Locale } from '@/i18n/config'

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

  // ✅ messages typés pour NextIntlClientProvider
  const messages = (await loadMessages(locale)) as AbstractIntlMessages

  return (
    <NextIntlClientProvider locale={locale as Locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
