import Link from 'next/link'
import Image from 'next/image'

interface ProductCardProps {
  id: string
  title: string
  price: number
  imageUrl: string
  slug: string
}

export default function ProductCard({ id, title, price, imageUrl, slug }: ProductCardProps) {
  return (
    <Link href={`/produit/${slug}`} className="group block overflow-hidden rounded-lg border hover:shadow-lg transition">
      <div className="relative h-56 sm:h-64">
        <Image src={imageUrl} alt={title} fill className="object-cover transition group-hover:scale-105" />
      </div>
      <div className="p-4">
        <h3 className="text-base font-medium line-clamp-2">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{price.toFixed(2)} €</p>
      </div>
    </Link>
  )
}
