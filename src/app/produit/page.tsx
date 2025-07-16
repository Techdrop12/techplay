import ProductCard from '@/components/product/ProductCard'
import { getBestProducts } from '@/lib/data'

export default async function ProductListPage() {
  const products = await getBestProducts()

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Nos Produits</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </main>
  )
}
