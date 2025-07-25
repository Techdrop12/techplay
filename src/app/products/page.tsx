import { getAllProducts } from '@/lib/data'
import ProductCatalogue from '@/components/ProductCatalogue'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tous les produits – TechPlay',
  description: 'Parcourez notre catalogue complet de produits TechPlay. Livraison rapide, innovation garantie.',
  openGraph: {
    title: 'Tous les produits – TechPlay',
    description: 'Parcourez notre catalogue complet de produits TechPlay. Livraison rapide, innovation garantie.',
    url: 'https://techplay.example.com/products',
    siteName: 'TechPlay',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://techplay.example.com/og-products.jpg',
        width: 1200,
        height: 630,
        alt: 'Catalogue TechPlay',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tous les produits – TechPlay',
    description: 'Parcourez notre catalogue complet de produits TechPlay. Livraison rapide, innovation garantie.',
  },
}

export default async function ProductsPage() {
  const products = await getAllProducts()

  return (
    <main className="max-w-screen-xl px-6 mx-auto py-8 space-y-10" role="main">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Tous les produits
      </h1>
      {products?.length > 0 ? (
        <ProductCatalogue products={products} />
      ) : (
        <p className="text-gray-600 dark:text-gray-400 text-center py-16 text-lg">
          Aucun produit disponible pour le moment. Revenez bientôt !
        </p>
      )}
    </main>
  )
}
