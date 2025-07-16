'use client'

import Image from 'next/image'
import { useState } from 'react'
import { formatPrice } from '@/lib/formatPrice'
import StarsRating from './StarsRating'
import PricingBadge from './PricingBadge'

interface Props {
  slug: string
}

export default function ProductDetail({ slug }: Props) {
  const [quantity, setQuantity] = useState(1)

  // Simulation temporaire
  const product = {
    title: 'Produit test',
    image: '/product.jpg',
    price: 24.99,
    rating: 4,
    description: 'Description du produit ici.',
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="relative aspect-square">
        <Image src={product.image} alt={product.title} fill className="rounded object-cover" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{product.title}</h1>
        <div className="mt-2 flex items-center gap-2">
          <PricingBadge>{formatPrice(product.price)}</PricingBadge>
          <StarsRating rating={product.rating} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-6 flex items-center gap-4">
          <button className="rounded bg-black px-5 py-2 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100">
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  )
}
