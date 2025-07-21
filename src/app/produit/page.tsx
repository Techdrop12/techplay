import ProductCard from '@/components/ProductCard'
import { getBestProducts } from '@/lib/data'
import type { Metadata } from 'next'
import type { Product } from '@/types/product'

export const metadata: Metadata = {
  title: 'Nos produits – TechPlay',
  description: 'Découvrez les meilleurs produits sélectionnés par TechPlay.',
  alternates: {
    canonical: '/produit',
  },
}

export default async function ProductListPage() {
  const products: Product[] = await getBestProducts()

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-brand">
        Nos Meilleurs Produits
      </h1>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">Aucun produit disponible pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={{
                ...product,
                title: product.title ?? product.name,
                image: product.image ?? product.imageUrl ?? '/placeholder.png',
              }}
            />
          ))}
        </div>
      )}
    </main>
  )
}
