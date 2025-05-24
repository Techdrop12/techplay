'use client'
import Head from 'next/head'
import { useTranslations } from 'next-intl'
import { getFallbackDescription } from '@/lib/metaFallback'

export default function SEOHead({ titleKey, descriptionKey, overrideTitle, overrideDescription, product, image, url }) {
  const t = useTranslations('seo')

  const title = overrideTitle || (titleKey ? t(titleKey) : product?.title || 'TechPlay')
  const description = overrideDescription || (descriptionKey ? t(descriptionKey) : getFallbackDescription(product))

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={image || '/logo.png'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || '/logo.png'} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  )
}
