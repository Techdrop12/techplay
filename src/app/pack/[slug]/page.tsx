import { getPackBySlug } from '@/lib/data'
import type { Metadata } from 'next'
import type { Pack } from '@/types/product'
import PackDetails from '@/components/PackDetails'
import { notFound } from 'next/navigation'
import ProductJsonLd from '@/components/JsonLd/ProductJsonLd'

interface Props {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const pack = await getPackBySlug(params.slug)

  if (!pack) {
    return {
      title: 'Pack introuvable – TechPlay',
      description: 'Ce pack n’est pas ou plus disponible sur notre boutique TechPlay.',
    }
  }

  return {
    title: `${pack.title} | Pack TechPlay`,
    description: pack.description || 'Découvrez nos packs exclusifs TechPlay.',
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/pack/${params.slug}`,
    },
    openGraph: {
      title: pack.title,
      description: pack.description || '',
      type: 'website', // ✅ corrigé (plus "product")
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/pack/${params.slug}`,
      images: pack.image
        ? [{ url: pack.image, alt: pack.title }]
        : [{ url: '/placeholder.png', alt: 'Pack TechPlay' }],
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

      <ProductJsonLd product={safePack} />
    </>
  )
}
