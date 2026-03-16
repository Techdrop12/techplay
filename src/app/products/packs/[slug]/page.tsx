import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import type { Pack } from '@/types/product';
import type { Metadata } from 'next';

import ProductJsonLd from '@/components/JsonLd/ProductJsonLd';
import PackDetails from '@/components/PackDetails';
import { BRAND } from '@/lib/constants';
import { getPackBySlug } from '@/lib/data';

export const revalidate = 1800;

const SITE = BRAND.URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);
  if (!pack) {
    const t = await getTranslations('seo_extra');
    return {
      title: t('pack_not_found_title'),
      description: t('pack_not_found_description'),
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `${pack.title} | Pack TechPlay`,
    description: pack.description || 'Découvrez nos packs exclusifs TechPlay.',
    alternates: { canonical: `${SITE}/products/packs/${slug}` },
    openGraph: {
      title: pack.title,
      description: pack.description || '',
      type: 'website',
      url: `${SITE}/products/packs/${slug}`,
      images: pack.image
        ? [{ url: pack.image, alt: pack.title }]
        : [{ url: `${SITE}/placeholder.png`, alt: 'Pack TechPlay' }],
    },
  };
}

export default async function PackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);
  if (!pack) return notFound();

  const safePack = pack as Pack;

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 py-10" aria-label={`Page pack : ${safePack.title}`}>
        <PackDetails pack={safePack} />
      </main>

      {/* On réutilise le JSON-LD "Product" pour le pack (prix, image, etc.) */}
      <ProductJsonLd product={safePack} />
    </>
  );
}
