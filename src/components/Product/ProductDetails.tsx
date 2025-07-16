import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

export default function ProductDetails({ product }: { product: any }) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="relative w-full h-80 md:h-[28rem]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain"
        />
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
        <p className="text-brand text-xl font-semibold mb-4">
          {formatPrice(product.price)}
        </p>
        <p className="text-gray-600 dark:text-gray-400">{product.description}</p>
      </div>
    </div>
  )
}
