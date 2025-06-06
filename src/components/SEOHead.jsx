// src/components/SEOHead.jsx
'use client';

import Head from 'next/head';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

// Fallback description si aucun descriptionKey ni produit n’est fourni
import { getFallbackDescription } from '@/lib/metaFallback';

// JSON-LD components
import ProductJsonLd from './ProductJsonLd';
import OrganizationJsonLd from './JsonLd/OrganizationJsonLd';
import BreadcrumbJsonLd from './JsonLd/BreadcrumbJsonLd';

/**
 * Composant SEOHead “full-option” :
 *
 * Props acceptées :
 *  — titleKey           : clé de traduction dans namespace “seo” (ex: "homepage_title")
 *  — descriptionKey     : clé de traduction dans namespace “seo” (ex: "homepage_description")
 *  — overrideTitle      : (optionnel) texte brut pour le <title> (remplace titleKey)
 *  — overrideDescription: (optionnel) texte brut pour <meta name="description"> (remplace descriptionKey/fallback)
 *  — product            : (optionnel) objet produit { title, description?, … }
 *  — image              : (optionnel) URL de l’image Open Graph
 *  — url                : (optionnel) URL canonique (sinon utilise NEXT_PUBLIC_SITE_URL + pathname)
 *  — noIndex            : (optionnel, booléen) si true ajoute <meta name="robots" content="noindex, nofollow" />
 *  — breadcrumbSegments : (optionnel) tableau de segments { label, url } pour injecter BreadcrumbJsonLd
 */
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
  // pour les traductions SEO (namespace 'seo')
  const tSeo = useTranslations('seo');
  const locale = useLocale();
  const pathname = usePathname();

  // Construction de l’URL complète
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
  const fullUrl = url ? url : `${siteUrl}${pathname || ''}`;

  // Image par défaut si pas d’image produit
  const fallbackImage = `${siteUrl}/logo.png`;

  // Calcul du titre :
  // 1) overrideTitle, 2) titleKey via tSeo, 3) product.title, 4) “TechPlay”
  const title = overrideTitle
    ? overrideTitle
    : titleKey
      ? tSeo(titleKey)
      : product?.title
        ? product.title
        : 'TechPlay';

  // Calcul de la description :
  // 1) overrideDescription, 2) descriptionKey via tSeo, 3) getFallbackDescription(product), 4) fallback générique
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
        {/* Titre et meta de base */}
        <title>{title}</title>
        <meta name="description" content={description} />
        {noIndex && <meta name="robots" content="noindex, nofollow" />}

        {/* Viewport & Charset */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />

        {/* Open Graph */}
        <meta property="og:type" content={product ? 'product' : 'website'} />
        <meta property="og:locale" content={locale || 'fr'} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image || fallbackImage} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:site_name" content="TechPlay" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image || fallbackImage} />

        {/* Canonical & Favicon */}
        <link rel="canonical" href={fullUrl} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* JSON-LD */}
      <OrganizationJsonLd />
      {product && <ProductJsonLd product={product} />}
      {breadcrumbSegments && (
        <BreadcrumbJsonLd pathSegments={breadcrumbSegments} />
      )}
    </>
  );
}
