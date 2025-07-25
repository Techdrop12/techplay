import { getAllProducts } from '@/lib/data'
import ProductCatalogue from '@/components/ProductCatalogue'

export const metadata = {
  title: 'Catalogue produits TechPlay',
  description: 'Découvrez tous les produits high-tech de TechPlay, avec filtres et recherche avancée.',
  keywords: 'TechPlay, catalogue, produits, high-tech, dropshipping',
}

export default async function ProductsPage() {
  const products = await getAllProducts()

  return <ProductCatalogue products={products} />
}
