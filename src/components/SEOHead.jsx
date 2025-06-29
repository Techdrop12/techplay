// src/components/SEOHead.jsx
import Head from 'next/head';
import { getFallbackDescription } from '@/lib/metaFallback';
import ProductJsonLd from './JsonLd/ProductJsonLd';
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
  breadcrumbSegments,
}) {
  const siteName = 'TechPlay';

  const safeTitle =
    overrideTitle ??
    (product && typeof product.title === 'string' ? product.title : siteName);

  const title = safeTitle.includes(siteName)
    ? safeTitle
    : `${safeTitle} | ${siteName}`;

  const safeDescription =
    overrideDescription ??
    (product && typeof product === 'object'
      ? getFallbackDescription(product)
      : 'TechPlay – boutique high-tech, gadgets et innovations.');

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://techplay.fr';

  const fullUrl = url || siteUrl;
  const fallbackImage = `${siteUrl}/logo.png`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={safeDescription} />
        {noIndex && <meta name="robots" content="noindex, nofollow" />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />

        {/* Open Graph */}
        <meta property="og:type" content={product ? 'product' : 'website'} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={safeDescription} />
        <meta property="og:image" content={image || fallbackImage} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:site_name" content={siteName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={safeDescription} />
        <meta name="twitter:image" content={image || fallbackImage} />

        <link rel="canonical" href={fullUrl} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* JSON-LD sécurisés */}
      <OrganizationJsonLd />
      {product && typeof product === 'object' && (
        <ProductJsonLd product={product} siteUrl={siteUrl} />
      )}
      {Array.isArray(breadcrumbSegments) && breadcrumbSegments.length > 0 && (
        <BreadcrumbJsonLd pathSegments={breadcrumbSegments} />
      )}
    </>
  );
}
