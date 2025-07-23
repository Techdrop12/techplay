import { getPackBySlug } from '@/lib/data'
import type { Metadata } from 'next'
import type { Pack } from '@/types/product'
import ClientOnly from '@/components/ClientOnly'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const pack = await getPackBySlug(params.slug)
  return {
    title: pack?.title ? `${pack.title} – Pack TechPlay` : 'Pack introuvable – TechPlay',
    description: pack?.description || 'Détail du pack | TechPlay',
    alternates: { canonical: `/pack/${params.slug}` },
    openGraph: {
      title: pack?.title || 'Pack introuvable',
      description: pack?.description || 'Découvrez nos packs exclusifs TechPlay.',
      url: `https://www.techplay.fr/pack/${params.slug}`,
      type: 'website',
      images: pack?.image ? [{ url: pack.image, alt: pack.title }] : [],
    },
  }
}

export default async function PackPage({ params }: { params: { slug: string } }) {
  const pack = await getPackBySlug(params.slug)
  if (!pack)
    return (
      <main className="max-w-4xl mx-auto px-4 py-10 text-center text-red-600 dark:text-red-400">
        <p>Pack introuvable</p>
      </main>
    )

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <ClientOnly
        load={() => import('@/components/PackDetails')}
        fallback={
          <p className="text-center py-10 text-gray-500 animate-pulse dark:text-gray-400">
            Chargement du pack...
          </p>
        }
        props={{ pack }}
      />
    </main>
  )
}
