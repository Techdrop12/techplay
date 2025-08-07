'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import WishlistButton from '@/components/WishlistButton'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import QuantitySelector from '@/components/QuantitySelector'
import RatingStars from '@/components/ui/RatingStars'
import PricingBadge from '@/components/PricingBadge'
import AddToCartButton from '@/components/AddToCartButton'
import ReviewForm from '@/components/ReviewForm'
import StickyCartSummary from '@/components/StickyCartSummary'
import ProductTags from '@/components/ProductTags'
import type { Product } from '@/types/product'
import { logEvent } from '@/lib/logEvent'

interface Props {
  product: Product
  locale?: string
}

export default function ProductDetail({ product, locale = 'fr' }: Props) {
  const [quantity, setQuantity] = useState<number>(1)

  const {
    _id,
    slug = '',
    title = 'Produit',
    price = 0,
    oldPrice,
    image = '/placeholder.png',
    description = '',
    rating = 4,
    isNew,
    isBestSeller,
    tags,
  } = product ?? {}

  const handleAdd = () => {
    logEvent({
      action: 'add_to_cart',
      category: 'Panier',
      label: title,
      value: price * quantity,
    })
  }

  return (
    <motion.section
      className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto px-4 py-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      aria-labelledby="product-title"
      data-product-id={_id}
      data-product-slug={slug}
      role="region"
      aria-live="polite"
    >
      {/* 📸 Image produit */}
      <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
        <Image
          src={image}
          alt={`Image du produit ${title}`}
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
          placeholder="blur"
          blurDataURL="/placeholder-blur.png"
        />
        <div className="absolute bottom-4 right-4 z-10">
          <PricingBadge price={price} oldPrice={oldPrice} showDiscountLabel showOldPrice />
        </div>
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none select-none z-10">
          {isNew && (
            <span className="bg-green-600 text-white px-3 py-1 rounded-full font-semibold text-sm shadow-md">
              Nouveau
            </span>
          )}
          {isBestSeller && (
            <span className="bg-yellow-400 text-black px-3 py-1 rounded-full font-semibold text-sm shadow-md">
              Best Seller
            </span>
          )}
        </div>
      </div>

      {/* 📝 Infos produit */}
      <div className="flex flex-col justify-between space-y-8">
        <div>
          <h1
            id="product-title"
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white"
            tabIndex={-1}
          >
            {title}
          </h1>

          <RatingStars value={rating} editable={false} />

          <FreeShippingBadge price={price} minimal className="mt-2" />

          {description && (
            <p className="mt-6 text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-lg">
              {description}
            </p>
          )}

          {Array.isArray(tags) && tags.length > 0 && (
            <div className="mt-4">
              <ProductTags tags={tags} />
            </div>
          )}
        </div>

        {/* 🛒 Actions */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label htmlFor="quantity" className="text-lg font-semibold text-gray-900 dark:text-white">
              Quantité :
            </label>
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              id="quantity"
              aria-describedby="quantity-desc"
            />
          </div>
          <p id="quantity-desc" className="sr-only">
            Sélectionnez la quantité à ajouter au panier
          </p>

          <AddToCartButton product={{ ...product, quantity }} onAdd={handleAdd} />

          <WishlistButton
            product={{ _id, slug, title, price, image }}
            floating={false}
            className="mt-4"
          />
        </div>
      </div>

      <StickyCartSummary locale={locale} />

      <div className="lg:col-span-2 mt-12">
        <ReviewForm productId={_id} />
      </div>
    </motion.section>
  )
}
