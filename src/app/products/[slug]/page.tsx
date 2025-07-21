import { getProductBySlug } from '@/lib/data'
import type { Metadata } from 'next'
import type { Product } from '@/types/product'
import ClientOnly from '@/components/ClientOnly'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  return {
    title: product?.title ? `${product.title} – TechPlay` : 'Produit introuvable – TechPlay',
    description: product?.description || 'Détail du produit | TechPlay',
    alternates: { canonical: `/produit/${params.slug}` },
    openGraph: {
      title: product?.title || 'Produit introuvable',
      description: product?.description || 'Découvrez les meilleurs produits TechPlay.',
      type: 'website',
      url: `https://www.techplay.fr/produit/${params.slug}`,
      images: product?.image ? [{ url: product.image, alt: product.title || 'Produit TechPlay' }] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  if (!product) return <p>Produit introuvable</p>

  return (
    <main className="container py-16">
      <ClientOnly
        load={() => import('@/components/ProductDetail')}
        fallback={<p className="text-center py-10 text-gray-500 animate-pulse">Chargement du produit...</p>}
        props={{ product }}
      />
    </main>
  )
}
