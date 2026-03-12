import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { isLocale, toOgLocale, type Locale } from '@/lib/language'

export function generateStaticParams(): { locale: Locale }[] {
  return (['fr', 'en'] as const).map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  return {
    openGraph: {
      locale: toOgLocale(locale),
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return children
}