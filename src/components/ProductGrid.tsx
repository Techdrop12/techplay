import ProductCard from './ProductCard'

interface Product {
  id: string
  title: string
  price: number
  imageUrl: string
  slug: string
}

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map(product => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  )
}
