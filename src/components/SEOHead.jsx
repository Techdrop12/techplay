// ✅ /src/components/SEOHead.jsx (full SEO, JSON-LD, bonus UX)
import Head from 'next/head';
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
  const title = overrideTitle ?? product?.title ?? 'TechPlay';
  const description =
    overrideDescription ??
    (product ? getFallbackDescription(product) : 'TechPlay – boutique tech');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
  const fullUrl = url || `${siteUrl}`;
  const fallbackImage = `${siteUrl}/logo.png`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {noIndex && <meta name="robots" content="noindex, nofollow" />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta property="og:type" content={product ? 'product' : 'website'} />
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
      {breadcrumbSegments && <BreadcrumbJsonLd pathSegments={breadcrumbSegments} />}
    </>
  );
}
