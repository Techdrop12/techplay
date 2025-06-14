// ✅ src/components/SEOHead.jsx corrigé (ajout du fallback timezone)
'use client';

import Head from 'next/head';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { getFallbackDescription } from '@/lib/metaFallback';
import ProductJsonLd from './ProductJsonLd';
import OrganizationJsonLd from './JsonLd/OrganizationJsonLd';
import BreadcrumbJsonLd from './JsonLd/BreadcrumbJsonLd';

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
  const tSeo = useTranslations('seo');
  const locale = useLocale() || 'fr'; // ✅ fallback locale
  const pathname = usePathname();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
  const fullUrl = url ? url : `${siteUrl}${pathname || ''}`;
  const fallbackImage = `${siteUrl}/logo.png`;

  const title = overrideTitle
    ? overrideTitle
    : titleKey
      ? tSeo(titleKey)
      : product?.title
        ? product.title
        : 'TechPlay';

  const description = overrideDescription
    ? overrideDescription
    : descriptionKey
      ? tSeo(descriptionKey)
      : product
        ? getFallbackDescription(product)
        : 'TechPlay – boutique tech';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {noIndex && <meta name="robots" content="noindex, nofollow" />}

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />

        <meta property="og:type" content={product ? 'product' : 'website'} />
        <meta property="og:locale" content={locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image || fallbackImage} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:site_name" content="TechPlay" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image || fallbackImage} />

        <link rel="canonical" href={fullUrl} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <OrganizationJsonLd />
      {product && <ProductJsonLd product={product} />}
      {breadcrumbSegments && (
        <BreadcrumbJsonLd pathSegments={breadcrumbSegments} />
      )}
    </>
  );
}