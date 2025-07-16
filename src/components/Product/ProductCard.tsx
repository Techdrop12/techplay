import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface Product {
  slug: string
  image: string
  name: string
  price: number
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/produit/${product.slug}`}>
      <div className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
        <div className="relative w-full h-48">
          <Image
            src={product.image || '/placeholder.png'}
            alt={product.name || 'Produit'}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
          <p className="text-brand font-bold mt-2">{formatPrice(product.price)}</p>
        </div>
      </div>
    </Link>
  )
}
