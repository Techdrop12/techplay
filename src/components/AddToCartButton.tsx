'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types/product'
import Button from '@/components/Button'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

interface Props {
  product: Product & { quantity: number }
  onAdd?: () => void
}

export default function AddToCartButton({ product, onAdd }: Props) {
  const { addToCart } = useCart()
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    if (loading) return
    setLoading(true)

    addToCart({
      _id: product._id,
      slug: product.slug,
      title: product.title ?? 'Produit',
      image: product.image ?? '/placeholder.png',
      price: product.price,
      quantity: product.quantity,
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

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      const sticky = document.querySelector('[aria-label="Résumé panier mobile"]')
      sticky?.scrollIntoView({ behavior: 'smooth' })
    }

    if (onAdd) onAdd()
    setTimeout(() => setLoading(false), 500)
  }

  return (
    <motion.div whileTap={{ scale: 0.96 }} className="w-full">
      <Button
        onClick={handleClick}
        aria-label={`Ajouter ${product.title ?? 'produit'} au panier`}
        type="button"
        className="w-full py-4 text-lg font-extrabold bg-accent hover:bg-accent-dark text-white rounded-xl shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-accent/70 active:scale-95"
        disabled={loading}
      >
        {loading ? 'Ajout en cours...' : 'Ajouter au panier'}
      </Button>
    </motion.div>
  )
}
