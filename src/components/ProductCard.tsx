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
  const { _id, slug, title, price, oldPrice, image, rating, isNew, isBestSeller } = product

  const displayTitle = title ?? 'Produit'
  const imageUrl = image ?? '/placeholder.png'

  const discount =
    oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null

  const handleClick = () => {
    logEvent({
      action: 'product_card_click',
      category: 'engagement',
      label: displayTitle,
      value: price,
    })
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: '0 15px 25px rgba(0,0,0,0.25)' }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="group relative border rounded-3xl overflow-hidden bg-white dark:bg-gray-900 shadow-lg hover:shadow-2xl transition-shadow duration-300 focus-within:ring-4 focus-within:ring-blue-600"
      role="listitem"
      aria-label={`Produit : ${displayTitle}`}
      tabIndex={0}
      onFocus={handleClick}
      onClick={handleClick}
    >
      <Link
        href={`/produit/${slug}`}
        className="block focus:outline-none focus:ring-4 focus:ring-blue-600 rounded-2xl"
        aria-label={`Voir la fiche produit : ${displayTitle}`}
        onClick={handleClick}
      >
        <div className="relative w-full h-64 sm:h-72 bg-gray-100 dark:bg-gray-800 rounded-t-3xl overflow-hidden">
          <Image
            src={imageUrl}
            alt={`Image du produit ${displayTitle}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority={priority}
            placeholder="blur"
            blurDataURL="/placeholder-blur.png"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-20 select-none pointer-events-none">
            {isNew && (
              <span className="bg-green-500 text-white px-3 py-0.5 rounded-full text-xs font-semibold shadow-lg">
                Nouveau
              </span>
            )}
            {isBestSeller && (
              <span className="bg-yellow-400 text-black px-3 py-0.5 rounded-full text-xs font-semibold shadow-lg">
                Best Seller
              </span>
            )}
            {discount && (
              <span
                className="bg-red-600 text-white px-3 py-0.5 rounded-full text-xs font-semibold shadow-lg"
                aria-label={`${discount}% de réduction`}
              >
                -{discount}%
              </span>
            )}
          </div>
          {/* Rating */}
          {rating !== undefined && (
            <div
              className="absolute top-3 right-3 bg-yellow-400 text-black text-xs px-3 py-0.5 rounded-full shadow-lg select-none"
              aria-label={`Note moyenne : ${rating.toFixed(1)} étoiles`}
            >
              ⭐ {rating.toFixed(1)}
            </div>
          )}
        </div>

        <div className="p-5">
          <h3
            className="font-semibold text-lg sm:text-xl line-clamp-2 text-gray-900 dark:text-white"
            title={displayTitle}
          >
            {displayTitle}
          </h3>
          <div className="mt-3 flex items-center gap-3">
            <span
              className="text-brand font-extrabold text-lg sm:text-xl"
              aria-label={`Prix : ${formatPrice(price)}`}
            >
              {formatPrice(price)}
            </span>
            {oldPrice && (
              <span
                className="line-through text-sm text-gray-400 dark:text-gray-500"
                aria-label="Ancien prix barré"
              >
                {formatPrice(oldPrice)}
              </span>
            )}
          </div>
          <FreeShippingBadge price={price} minimal />
        </div>
      </Link>

      {showWishlistIcon && (
        <div className="absolute bottom-4 right-4 px-3 py-2 flex justify-end items-center">
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
