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
 *  — overrideDescription: (optionnel) texte brut pour la <meta name="description"> (remplace descriptionKey/fallback)
 *  — product            : (optionnel) objet produit { title, description?, ... } 
 *  — image              : (optionnel) URL de l’image Open Graph
 *  — url                : (optionnel) URL canonique (sinon utilisera NEXT_PUBLIC_SITE_URL + pathname)
 *  — noIndex            : (optionnel, booléen) si true ajoute `<meta name="robots" content="noindex, nofollow" />`
 *  — breadcrumbSegments : (optionnel) tableau de segments `{ label, url }` pour injecter BreadcrumbJsonLd
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
  const t = useTranslations('seo');
  const pathname = usePathname();
  const locale = useLocale();

  // Construction de l’URL complète : on prend la prop url si fournie, sinon on compose
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
  const fullUrl = url
    ? url
    : `${siteUrl}${pathname || ''}`;

  // Image par défaut si pas d’image produit
  const fallbackImage = `${siteUrl}/logo.png`;

  // Calcul du titre :
  // — Si overrideTitle est fourni, on le prend.
  // — Sinon, si titleKey existe, on fait t(titleKey).
  // — Sinon, si un produit est passé, on prend product.title (pour les pages produit).
  // — Sinon, on met “TechPlay” par défaut.
  const title = overrideTitle
    ? overrideTitle
    : titleKey
      ? t(titleKey)
      : product?.title
        ? product.title
        : 'TechPlay';

  // Calcul de la description :
  // — Si overrideDescription est fourni, on le prend.
  // — Sinon, si descriptionKey existe, on fait t(descriptionKey).
  // — Sinon, on utilise getFallbackDescription(product) si le produit est fourni.
  // — Sinon, on met “TechPlay – boutique tech” par défaut.
  const description = overrideDescription
    ? overrideDescription
    : descriptionKey
      ? t(descriptionKey)
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

        {/* Métas viewport et charset */}
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

      {/* Injection JSON-LD */}
      <OrganizationJsonLd />
      {product && <ProductJsonLd product={product} />}
      {breadcrumbSegments && (
        <BreadcrumbJsonLd pathSegments={breadcrumbSegments} />
      )}
    </>
  );
}
