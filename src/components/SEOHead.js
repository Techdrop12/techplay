'use client'

import Head from 'next/head'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { getFallbackDescription } from '@/lib/metaFallback'
import ProductJsonLd from './ProductJsonLd'
import OrganizationJsonLd from './JsonLd/OrganizationJsonLd'
import BreadcrumbJsonLd from './JsonLd/BreadcrumbJsonLd'

export default function SEOHead({
  titleKey,
  descriptionKey,
  overrideTitle,
  overrideDescription,
  product,
  image,
  url,
  noIndex = false,
  breadcrumbSegments
}) {
  const t = useTranslations('seo')
  const pathname = usePathname()
  const locale = useLocale()
  const fullUrl = url || `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`
  const fallbackImage = `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`

  const title = overrideTitle || (titleKey ? t(titleKey) : product?.title || 'TechPlay')
  const description = overrideDescription || (descriptionKey ? t(descriptionKey) : getFallbackDescription(product))

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {noIndex && <meta name="robots" content="noindex, nofollow" />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image || fallbackImage} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:site_name" content="TechPlay" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image || fallbackImage} />

        {/* Canonical */}
        <link rel="canonical" href={fullUrl} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* JSON-LD Injection */}
      <OrganizationJsonLd />
      {product && <ProductJsonLd product={product} />}
      {breadcrumbSegments && <BreadcrumbJsonLd pathSegments={breadcrumbSegments} />}
    </>
  )
}
