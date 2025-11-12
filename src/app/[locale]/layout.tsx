import { notFound } from "next/navigation"

import type { Metadata } from "next"

import { isLocale, type Locale } from "@/i18n/config"
import { toOgLocale } from "@/lib/language"

/** Prégénère fr/en */
export function generateStaticParams(): { locale: Locale }[] {
  return (["fr","en"] as Locale[]).map((locale) => ({ locale }))
}

/** Next 15: params est asynchrone → on l'attend */
export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params
  const loc = isLocale(locale) ? (locale as Locale) : ("fr" as Locale)
  return { openGraph: { locale: toOgLocale(loc) } }
}

/** Layout */
export default async function LocaleLayout(
  { children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }
) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  )
}
