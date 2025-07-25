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
      title: product.title ?? 'Produit',
      image: product.image ?? '/placeholder.png',
    })

    toast.success('Produit ajouté au panier 🎉', {
      duration: 3000,
      position: 'top-right',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
      iconTheme: {
        primary: '#2563eb',
        secondary: '#fff',
      },
    })
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
        className="w-full py-4 text-lg font-extrabold bg-accent hover:bg-accent-dark text-white rounded-xl shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-accent/70 active:scale-95"
      >
        Ajouter au panier
      </Button>
    </motion.div>
  )
}
