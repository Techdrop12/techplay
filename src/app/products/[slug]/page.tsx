import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getTranslations } from 'next-intl/server';

import type { Product } from '@/types/product';
import type { Metadata } from 'next';

import ProductJsonLd from '@/components/JsonLd/ProductJsonLd';
import ProductDetail from '@/components/ProductDetail';
import ProductGrid from '@/components/ProductGrid';
import { LIST_NAMES } from '@/lib/analytics-events';
import { getProductBySlug, getRelatedProducts } from '@/lib/data';
import { DEFAULT_LOCALE } from '@/lib/language';
import { getFallbackDescription } from '@/lib/meta';
import { generateProductMeta, jsonLdBreadcrumbs } from '@/lib/seo';

export const revalidate = 1800;

const getProductCached = cache(async (slug: string) => getProductBySlug(slug));

type ProductSeoRecord = Product & Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toSeoRecord(product: Product | null): ProductSeoRecord | null {
  if (!product || !isRecord(product)) return null;
  return product as ProductSeoRecord;
}

function readString(record: Record<string, unknown>, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function readNumber(record: Record<string, unknown>, keys: readonly string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    const parsed =
      typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim()
          ? Number(value)
          : NaN;

    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function readBoolean(
  record: Record<string, unknown>,
  keys: readonly string[]
): boolean | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') return value;
  }
  return undefined;
}

function readImage(record: Record<string, unknown>): string {
  const direct = readString(record, ['image']);
  if (direct) return direct;

  const images = record.images;
  if (Array.isArray(images)) {
    const first = images.find(
      (item): item is string => typeof item === 'string' && item.trim().length > 0
    );
    if (first) return first;
  }

  const gallery = record.gallery;
  if (Array.isArray(gallery)) {
    const first = gallery.find(
      (item): item is string => typeof item === 'string' && item.trim().length > 0
    );
    if (first) return first;
  }

  return '/og-image.jpg';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductCached(slug);
  const productRecord = toSeoRecord(product);
  const path = `/products/${slug}`;

  if (!product || !productRecord) {
    const t = await getTranslations('seo');
    return {
      title: t('product_not_found_title'),
      description: t('product_not_found_description'),
      robots: { index: false, follow: true },
    };
  }

  const title = product.title?.trim() || 'Produit';
  const brand = readString(productRecord, ['brand']);
  const category = readString(productRecord, ['category']);
  const tags = (productRecord.tags as string[] | undefined) ?? [];
  const keywords = [
    ...(category ? [category] : []),
    ...(brand ? [brand] : []),
    ...tags.filter((t): t is string => typeof t === 'string' && t.length > 0).slice(0, 8),
    'TechPlay',
    'achat',
  ].filter(Boolean);
  const description = getFallbackDescription(
    {
      title: product.title,
      brand,
      description: product.description,
      price: readNumber(productRecord, ['price']),
      currency: 'EUR',
    },
    { maxLen: 160 }
  );

  const image = readImage(productRecord);
  const noindex = readBoolean(productRecord, ['noindex']) === true;
  const price = readNumber(productRecord, ['price']);

  const base = generateProductMeta({
    title,
    description,
    url: path,
    image,
  });

  return {
    ...base,
    ...(keywords.length > 0 ? { keywords: [...new Set(keywords)] } : {}),
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    other: {
      ...(typeof price === 'number'
        ? {
            'product:price:amount': String(price),
            'product:price:currency': 'EUR',
          }
        : {}),
      ...(brand ? { 'product:brand': brand } : {}),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductCached(slug);
  if (!product) {
    notFound();
  }
  const relatedProducts = await getRelatedProducts(slug, product.category ?? null, 4);

  const crumbs = jsonLdBreadcrumbs([
    { name: 'Accueil', url: '/' },
    { name: 'Produits', url: '/products' },
    { name: product.title?.trim() || 'Produit', url: `/products/${product.slug}` },
  ]);

  return (
    <>
      <main
        className="max-w-6xl mx-auto px-4 py-10"
        aria-label={`Page produit : ${product.title?.trim() || 'Produit'}`}
      >
        <ProductDetail product={product} locale={DEFAULT_LOCALE} />
        {relatedProducts.length > 0 && (
          <section
            className="mt-16 pt-10 border-t border-[hsl(var(--border))]"
            aria-labelledby="related-products-heading"
          >
            <h2
              id="related-products-heading"
              className="text-xl font-bold text-[hsl(var(--text))] mb-6"
            >
              Vous aimerez aussi
            </h2>
            <ProductGrid
              products={relatedProducts}
              listName={LIST_NAMES.RELATED}
              emptyMessage=""
              showWishlistIcon
            />
          </section>
        )}
      </main>

      <ProductJsonLd product={product} maxReviews={3} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
    </>
  );
}
