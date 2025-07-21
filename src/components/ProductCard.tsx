'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import WishlistButton from '@/components/WishlistButton'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import { motion } from 'framer-motion'
import { Product } from '@/types/product'
import { logEvent } from '@/lib/logEvent'

interface ProductCardProps {
  product: Product
  priority?: boolean
  showWishlistIcon?: boolean
}

export default function ProductCard({
  product,
  priority = false,
  showWishlistIcon = false,
}: ProductCardProps) {
  const { _id, slug, title, price, oldPrice, image } = product

  const displayTitle = title ?? 'Produit'
  const imageUrl = image ?? '/placeholder.png'

  const discount =
    oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null

  const handleClick = () => {
    logEvent('product_card_click', {
      productId: _id,
      name: displayTitle,
    })
  }

  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.2 }}
      className="group border rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow hover:shadow-lg transition"
      role="listitem"
      aria-label={`Produit : ${displayTitle}`}
    >
      <Link
        href={`/produit/${slug}`}
        className="block focus:outline-none"
        aria-label={`Voir la fiche produit : ${displayTitle}`}
        onClick={handleClick}
      >
        <div className="relative w-full h-56 sm:h-64">
          <Image
            src={imageUrl}
            alt={`Image du produit ${displayTitle}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
          {discount && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded z-10">
              -{discount}%
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-base sm:text-lg line-clamp-2">
            {displayTitle}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-brand font-bold text-sm sm:text-base">
              {formatPrice(price)}
            </span>
            {oldPrice && (
              <span className="line-through text-sm text-gray-400">
                {formatPrice(oldPrice)}
              </span>
            )}
          </div>
          <FreeShippingBadge price={price} />
        </div>
      </Link>

      {showWishlistIcon && (
        <div className="px-4 pb-4 flex justify-between items-center">
          <WishlistButton
            product={{
              _id,
              slug,
              title: displayTitle,
              price,
              image: imageUrl,
            }}
          />
        </div>
      )}
    </motion.div>
  )
}
