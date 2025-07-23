import { getAllProducts } from '@/lib/data'
import ProductCatalogue from '@/components/ProductCatalogue'

export default async function ProductsPage() {
  const products = await getAllProducts()
  return <ProductCatalogue products={products} />
}
