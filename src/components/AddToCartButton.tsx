'use client'

import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types/product'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

interface Props {
  product: Product & { quantity: number }
}

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart()

  const handleClick = () => {
    addToCart({
      ...product,
      title: product.title ?? product.name,
    })

    toast.success('Produit ajouté au panier 🎉')
  }

  return (
    <Button
      onClick={handleClick}
      disabled={false}
      aria-label="Ajouter au panier"
      type="button"
    >
      Ajouter au panier
    </Button>
  )
}
