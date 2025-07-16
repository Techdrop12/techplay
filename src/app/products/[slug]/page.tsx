import { Metadata } from 'next'
import ProductDetail from '@/components/ProductDetail'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Produit – TechPlay',
    description: 'Détail du produit | TechPlay',
  }
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  return (
    <main className="container py-16">
      <ProductDetail slug={slug} />
    </main>
  )
}
