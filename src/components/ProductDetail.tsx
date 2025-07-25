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
    price = 0,
    oldPrice,
    image = '/placeholder.png',
    description = '',
    rating = 4,
  } = product ?? {}

  return (
    <>
      <motion.section
        className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto px-6 py-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        aria-labelledby="product-title"
        data-product-id={typeof _id === 'string' ? _id : ''}
        data-product-slug={slug || ''}
        role="region"
        aria-live="polite"
      >
        {/* Image produit */}
        <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-300 dark:border-gray-700">
          <Image
            src={image}
            alt={`Image du produit ${title}`}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            placeholder="blur"
            blurDataURL="/placeholder-blur.png"
          />
          <PricingBadge
            price={price}
            oldPrice={oldPrice}
            showDiscountLabel
            showOldPrice
          />
        </div>

        {/* Détails produit */}
        <div className="space-y-8">
          <h1
            id="product-title"
            className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight"
            tabIndex={-1}
          >
            {title}
          </h1>

          <RatingStars
            value={rating}
            aria-label={`Note moyenne : ${rating} sur 5 étoiles`}
          />

          <FreeShippingBadge price={price} />

          <WishlistButton
            product={{
              _id: typeof _id === 'string' ? _id : '',
              slug: slug || '',
              title,
              price,
              image,
            }}
          />

          <div className="flex flex-wrap items-center gap-6">
            <label htmlFor="quantity" className="font-semibold text-lg">
              Quantité :
            </label>
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              id="quantity"
              aria-describedby="quantity-desc"
            />
            <p id="quantity-desc" className="sr-only">
              Sélectionnez la quantité à ajouter au panier
            </p>
          </div>

          <AddToCartButton product={{ ...product, quantity }} />

          {description && (
            <p
              className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mt-6 text-lg"
              aria-label="Description du produit"
            >
              {description}
            </p>
          )}

          <ReviewForm productId={typeof _id === 'string' ? _id : ''} />
        </div>
      </motion.section>

      {/* Résumé panier sticky pour mobile */}
      <StickyCartSummary locale={locale} />
    </>
  )
}
