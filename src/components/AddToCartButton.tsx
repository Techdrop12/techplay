'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types/product'
import Button from '@/components/Button'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { logEvent } from '@/lib/logEvent'

type MinimalProduct = Pick<Product, '_id' | 'slug' | 'title' | 'image' | 'price'>

interface Props {
  product: MinimalProduct & { quantity?: number } // 👈 quantity optionnel
  onAdd?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function AddToCartButton({
  product,
  onAdd,
  size = 'md',
  className,
}: Props) {
  const { addToCart } = useCart()
  const [loading, setLoading] = useState(false)

  const sizeClasses =
    size === 'sm'
      ? 'py-2 px-3 text-sm'
      : size === 'lg'
      ? 'py-5 px-6 text-lg'
      : 'py-4 px-4 text-base'

  const handleClick = () => {
    if (loading) return
    setLoading(true)

    try {
      // quantité par défaut = 1
      const quantity = Math.max(1, Number(product.quantity ?? 1))

      addToCart({
        _id: product._id,
        slug: product.slug,
        title: product.title ?? 'Produit',
        image: product.image ?? '/placeholder.png',
        price: Number(product.price) || 0,
        quantity,
      })

      // Analytics (optionnel)
      try {
        logEvent?.({
          action: 'add_to_cart',
          category: 'ecommerce',
          label: product.title ?? 'Produit',
          value: Number(product.price) || 0,
        })
      } catch {}

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

      // Auto-scroll vers le résumé panier mobile si présent
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        const sticky = document.querySelector('[aria-label="Résumé panier mobile"]')
        sticky && sticky.scrollIntoView({ behavior: 'smooth' })
      }

      onAdd?.()
    } finally {
      // léger délai pour le feedback visuel
      setTimeout(() => setLoading(false), 450)
    }
  }

  return (
    <motion.div whileTap={{ scale: 0.96 }} className="w-full">
      <Button
        onClick={handleClick}
        aria-label={`Ajouter ${product.title ?? 'produit'} au panier`}
        type="button"
        className={[
          'w-full font-extrabold bg-accent hover:bg-accent-dark text-white rounded-xl shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-accent/70 active:scale-95',
          sizeClasses,
          loading ? 'opacity-80 cursor-not-allowed' : '',
          className || '',
        ].join(' ')}
        disabled={loading}
      >
        {loading ? 'Ajout en cours…' : 'Ajouter au panier'}
      </Button>
    </motion.div>
  )
}
