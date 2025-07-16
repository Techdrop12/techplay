import ProductCard from '@/components/product/ProductCard'
import { getBestProducts } from '@/lib/data'

export default async function BestProducts() {
  const products = await getBestProducts()

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Nos meilleures ventes</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  )
}
