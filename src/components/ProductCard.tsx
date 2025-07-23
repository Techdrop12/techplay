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
  const { _id, slug, title, price, oldPrice, image, rating } = product

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
      whileHover={{ scale: 1.015, boxShadow: '0 10px 15px rgba(0,0,0,0.2)' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="group border rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition-shadow duration-300"
      role="listitem"
      aria-label={`Produit : ${displayTitle}`}
      tabIndex={0}
      onFocus={handleClick}
      onClick={handleClick}
    >
      <Link
        href={`/produit/${slug}`}
        className="block focus:outline-none focus:ring-4 focus:ring-blue-500 rounded-lg"
        aria-label={`Voir la fiche produit : ${displayTitle}`}
        onClick={handleClick}
      >
        <div className="relative w-full h-56 sm:h-64 bg-gray-100 dark:bg-gray-800">
          <Image
            src={imageUrl}
            alt={`Image du produit ${displayTitle}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
          {discount && (
            <div
              className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded z-10 select-none"
              aria-label={`${discount}% de réduction`}
            >
              -{discount}%
            </div>
          )}
          {rating !== undefined && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded z-10 select-none">
              ⭐ {rating.toFixed(1)}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-base sm:text-lg line-clamp-2" title={displayTitle}>
            {displayTitle}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-brand font-bold text-sm sm:text-base">
              {formatPrice(price)}
            </span>
            {oldPrice && (
              <span className="line-through text-sm text-gray-400 dark:text-gray-500" aria-label="Ancien prix">
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
            aria-label={`Ajouter ${displayTitle} à la liste de souhaits`}
          />
        </div>
      )}
    </motion.div>
  )
}
