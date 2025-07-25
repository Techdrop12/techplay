'use client'

import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types/product'
import Button from '@/components/Button'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

interface Props {
  product: Product & { quantity: number }
}

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart()

  const handleClick = () => {
    addToCart({
      ...product,
      image: product.image ?? '/placeholder.png',
      title: product.title ?? 'Produit',
    })

    toast.success('Produit ajouté au panier 🎉')
  }

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className="w-full"
    >
      <Button
        onClick={handleClick}
        aria-label={`Ajouter ${product.title ?? 'produit'} au panier`}
        type="button"
        className="w-full py-4 text-lg font-bold bg-accent hover:bg-accent-dark text-white rounded-xl shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-accent/70 active:scale-95"
      >
        Ajouter au panier
      </Button>
    </motion.div>
  )
}
