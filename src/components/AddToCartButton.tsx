'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types/product'
import Button from '@/components/Button'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { logEvent } from '@/lib/logEvent'
import { trackAddToCart } from '@/lib/ga'

type MinimalProduct = Pick<Product, '_id' | 'slug' | 'title' | 'image' | 'price'>

interface Props {
  product: MinimalProduct & { quantity?: number } // 👈 quantity optionnel
  onAdd?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

export default function AddToCartButton({
  product,
  onAdd,
  size = 'md',
  className,
  disabled = false,
}: Props) {
  const { addToCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [srMessage, setSrMessage] = useState('')

  const sizeClasses =
    size === 'sm'
      ? 'py-2 px-3 text-sm'
      : size === 'lg'
      ? 'py-5 px-6 text-lg'
      : 'py-4 px-4 text-base'

  const handleClick = () => {
    if (loading || disabled) return

    // garde-fous sur les données
    const id = String(product?._id || '')
    const title = (product?.title || 'Produit').toString()
    const image = product?.image || '/placeholder.png'
    const price = Number(product?.price) || 0
    const quantity = clamp(Math.trunc(Number(product?.quantity ?? 1)), 1, 99)

    if (!id) {
      toast.error("Produit invalide — impossible d'ajouter au panier")
      return
    }

    setLoading(true)

    try {
      addToCart({ _id: id, slug: product.slug, title, image, price, quantity })

      // Analytics (tolérant)
      try {
        logEvent?.({
          action: 'add_to_cart',
          category: 'ecommerce',
          label: title,
          value: price * quantity,
        })
      } catch {}
      try {
        trackAddToCart?.({
          currency: 'EUR',
          value: price * quantity,
          items: [{ item_id: id, item_name: title, price, quantity }],
        })
      } catch {}

      toast.success('Produit ajouté au panier 🎉', {
        duration: 2800,
        position: 'top-right',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
        iconTheme: { primary: '#2563eb', secondary: '#fff' },
      })

      // Live region pour lecteurs d'écran
      setSrMessage(`${title} ajouté au panier`)

      // Auto-scroll vers le résumé panier mobile si présent
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        const sticky = document.querySelector('[aria-label="Résumé panier mobile"]')
        sticky && sticky.scrollIntoView({ behavior: 'smooth' })
      }

      onAdd?.()
    } finally {
      // petit délai pour laisser l'anim/feedback respirer
      setTimeout(() => setLoading(false), 450)
      // efface le message SR après un moment
      setTimeout(() => setSrMessage(''), 2000)
    }
  }

  return (
    <>
      {/* Région live pour a11y */}
      <span className="sr-only" role="status" aria-live="polite">
        {srMessage}
      </span>

      <motion.div whileTap={{ scale: 0.96 }} className="w-full">
        <Button
          onClick={handleClick}
          aria-label={`Ajouter ${product.title ?? 'produit'} au panier`}
          type="button"
          data-loading={loading ? 'true' : 'false'}
          aria-busy={loading ? 'true' : 'false'}
          className={[
            'w-full font-extrabold bg-accent hover:bg-accent-dark text-white rounded-xl shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-accent/70 active:scale-95',
            sizeClasses,
            (loading || disabled) ? 'opacity-80 cursor-not-allowed' : '',
            className || '',
          ].join(' ')}
          disabled={loading || disabled}
        >
          {loading ? 'Ajout en cours…' : 'Ajouter au panier'}
        </Button>
      </motion.div>
    </>
  )
}
