'use client'
import Head from 'next/head'
import { useTranslations } from 'next-intl'

export default function SEOHead({ titleKey, descriptionKey }) {
  const t = useTranslations('seo')

  return (
    <Head>
      <title>{t(titleKey)}</title>
      <meta name="description" content={t(descriptionKey)} />
      <meta property="og:title" content={t(titleKey)} />
      <meta property="og:description" content={t(descriptionKey)} />
      <meta property="og:type" content="website" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  )
}
