import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { Pack } from '@/types/product'
import { getPackBySlug } from '@/lib/data'
import PackDetails from '@/components/PackDetails'
import ProductJsonLd from '@/components/JsonLd/ProductJsonLd'

export const revalidate = 1800

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com').replace(/\/+$/, '')

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const pack = await getPackBySlug(params.slug)
  if (!pack) {
    return {
      title: 'Pack introuvable – TechPlay',
      description: 'Ce pack n’est pas ou plus disponible sur notre boutique TechPlay.',
      robots: { index: false, follow: true },
    }
  }

  return {
    title: `${pack.title} | Pack TechPlay`,
    description: pack.description || 'Découvrez nos packs exclusifs TechPlay.',
    alternates: { canonical: `${SITE}/products/packs/${params.slug}` },
    openGraph: {
      title: pack.title,
      description: pack.description || '',
      type: 'website',
      url: `${SITE}/products/packs/${params.slug}`,
      images: pack.image
        ? [{ url: pack.image, alt: pack.title }]
        : [{ url: `${SITE}/placeholder.png`, alt: 'Pack TechPlay' }],
    },
  }
}

export default async function PackPage({ params }: { params: { slug: string } }) {
  const pack = await getPackBySlug(params.slug)
  if (!pack) return notFound()

  const safePack = pack as Pack

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 py-10" aria-label={`Page pack : ${safePack.title}`}>
        <PackDetails pack={safePack} />
      </main>

      {/* On réutilise le JSON-LD “Product” pour le pack (prix, image, etc.) */}
      <ProductJsonLd product={safePack} />
    </>
  )
}
