'use client'

import Image from 'next/image'
import { useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { motion } from 'framer-motion'
import WishlistButton from '@/components/WishlistButton'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import QuantitySelector from '@/components/QuantitySelector'
import RatingStars from '@/components/ui/RatingStars'
import PricingBadge from '@/components/PricingBadge'
import AddToCartButton from '@/components/AddToCartButton'
import ReviewForm from '@/components/ReviewForm'
import StickyCartSummary from '@/components/StickyCartSummary'
import type { Product } from '@/types/product'

interface Props {
  product: Product
  locale?: string
}

export default function ProductDetail({ product, locale = 'fr' }: Props) {
  const [quantity, setQuantity] = useState<number>(1)

  const {
    _id,
    slug,
    title = 'Produit',
    price,
    oldPrice,
    image = '/placeholder.png',
    description = '',
    rating = 4,
  } = product

  return (
    <motion.section
      className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start max-w-7xl mx-auto px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-labelledby="product-title"
      data-product-id={_id}
      data-product-slug={slug}
    >
      {/* ✅ Image produit */}
      <div className="relative aspect-square w-full">
        <Image
          src={image}
          alt={`Image du produit ${title}`}
          fill
          className="rounded-lg object-cover shadow"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />
        <PricingBadge
          price={price}
          oldPrice={oldPrice}
          showDiscountLabel
          showOldPrice
        />
      </div>

      {/* ✅ Détails produit */}
      <div className="space-y-6">
        <h1
          id="product-title"
          className="text-3xl font-bold text-gray-900 dark:text-white"
        >
          {title}
        </h1>

        <RatingStars value={rating} />

        <FreeShippingBadge price={price} />

        <WishlistButton
          product={{ _id, slug, title, price, image }}
        />

        <div className="flex items-center gap-4">
          <label htmlFor="quantity" className="font-medium">
            Quantité :
          </label>
          <QuantitySelector value={quantity} onChange={setQuantity} />
        </div>

        <AddToCartButton product={{ ...product, quantity }} />

        {description && (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
            {description}
          </p>
        )}

        <ReviewForm productId={_id} />
      </div>

      {/* ✅ Résumé panier mobile sticky */}
      <StickyCartSummary locale={locale} />
    </motion.section>
  )
}
