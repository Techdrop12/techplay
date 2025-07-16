import { getProductBySlug } from '@/lib/data'
import ProductDetails from '@/components/product/ProductDetails'

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <ProductDetails product={product} />
    </main>
  )
}
