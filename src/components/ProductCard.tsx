'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import WishlistButton from '@/components/WishlistButton'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import AddToCartButton from '@/components/AddToCartButton'
import type { Product } from '@/types/product'
import { logEvent } from '@/lib/logEvent'

interface ProductCardProps {
  product: Product
  /** Priorise le chargement de l’image (LCP) */
  priority?: boolean
  /** Afficher le bouton wishlist */
  showWishlistIcon?: boolean
  /** Afficher le CTA “Ajouter au panier” */
  showAddToCart?: boolean
  /** Classe(s) personnalisée(s) */
  className?: string
}

export default function ProductCard({
  product,
  priority = false,
  showWishlistIcon = false,
  showAddToCart = true,
  className,
}: ProductCardProps) {
  const {
    _id,
    slug,
    title = 'Produit',
    price = 0,
    oldPrice,
    image = '/placeholder.png',
    rating,
    isNew,
    isBestSeller,
  } = product ?? {}

  const [imgError, setImgError] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const viewedRef = useRef(false)

  const discount =
    oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null

  // 🔎 Log “vue carte” une seule fois quand visible à l’écran
  useEffect(() => {
    if (!cardRef.current || viewedRef.current) return
    const el = cardRef.current
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !viewedRef.current) {
            viewedRef.current = true
            logEvent({
              action: 'product_card_view',
              category: 'engagement',
              label: title,
              value: price,
            })
          }
        })
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [title, price])

  const handleClick = () => {
    logEvent({
      action: 'product_card_click',
      category: 'engagement',
      label: title,
      value: price,
    })
  }

  const imgSrc = imgError ? '/placeholder.png' : image
  const productUrl = slug ? `/produit/${slug}` : '#'

  const hasRating = typeof rating === 'number' && !Number.isNaN(rating)

  // Microdonnées Product/Offer
  const priceContent = useMemo(() => price.toFixed(2), [price])

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={[
        'group relative border rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 shadow-md hover:shadow-xl transition focus-within:ring-4 focus-within:ring-accent/60',
        className || '',
      ].join(' ')}
      role="listitem"
      aria-label={`Produit : ${title}`}
      itemScope
      itemType="https://schema.org/Product"
    >
      <meta itemProp="name" content={title} />
      <Link
        href={productUrl}
        prefetch={false}
        className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/60 rounded-2xl"
        aria-label={`Voir la fiche produit : ${title}`}
        onClick={handleClick}
      >
        {/* Image + badges */}
        <div className="relative w-full h-64 sm:h-72 bg-gray-100 dark:bg-zinc-800 rounded-t-3xl overflow-hidden">
          <Image
            src={imgSrc}
            alt={`Image du produit ${title}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            placeholder="blur"
            blurDataURL="/placeholder-blur.png"
            onError={() => setImgError(true)}
            itemProp="image"
          />

          {/* 🏷️ Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 select-none pointer-events-none">
            {isNew && (
              <span className="bg-green-600 text-white px-3 py-0.5 rounded-full text-xs font-semibold shadow">
                Nouveau
              </span>
            )}
            {isBestSeller && (
              <span className="bg-yellow-400 text-black px-3 py-0.5 rounded-full text-xs font-semibold shadow">
                Best Seller
              </span>
            )}
            {discount && (
              <span
                className="bg-red-600 text-white px-3 py-0.5 rounded-full text-xs font-semibold shadow"
                aria-label={`${discount}% de réduction`}
              >
                -{discount}%
              </span>
            )}
          </div>

          {/* ⭐ Note */}
          {hasRating && (
            <div
              className="absolute top-3 right-3 bg-yellow-400 text-black text-xs px-3 py-0.5 rounded-full shadow select-none"
              aria-label={`Note moyenne : ${rating!.toFixed(1)} étoiles`}
            >
              ⭐ {rating!.toFixed(1)}
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-5">
          <h3
            className="font-semibold text-lg sm:text-xl line-clamp-2 text-gray-900 dark:text-white"
            title={title}
          >
            <span itemProp="name">{title}</span>
          </h3>

          <div className="mt-3 flex items-center gap-3">
            <span
              className="text-brand font-extrabold text-lg sm:text-xl"
              aria-label={`Prix : ${formatPrice(price)}`}
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <meta itemProp="priceCurrency" content="EUR" />
              <meta itemProp="price" content={priceContent} />
              {formatPrice(price)}
            </span>
            {oldPrice && (
              <span
                className="line-through text-sm text-gray-400 dark:text-gray-500"
                aria-label="Ancien prix"
              >
                {formatPrice(oldPrice)}
              </span>
            )}
          </div>

          {/* Microdonnées AggregateRating (optionnel) */}
          {hasRating && (
            <span
              itemProp="aggregateRating"
              itemScope
              itemType="https://schema.org/AggregateRating"
              className="sr-only"
            >
              <meta itemProp="ratingValue" content={rating!.toFixed(1)} />
              <meta itemProp="reviewCount" content="12" />
            </span>
          )}

          <FreeShippingBadge price={price} minimal className="mt-2" />
        </div>
      </Link>

      {/* ❤️ Bouton wishlist */}
      {showWishlistIcon && (
        <div className="absolute bottom-4 right-4 z-20">
          <WishlistButton
            product={{
              _id,
              slug,
              title,
              price,
              image,
            }}
            aria-label={`Ajouter ${title} à la liste de souhaits`}
          />
        </div>
      )}

      {/* 🛒 CTA “Ajouter au panier” (hors du <Link> pour l’accessibilité) */}
      {showAddToCart && (
        <div className="absolute bottom-4 left-4 z-20">
          <AddToCartButton
            product={{
              _id,
              slug,
              title,
              price,
              image,
            }}
            size="sm"
            aria-label={`Ajouter ${title} au panier`}
          />
        </div>
      )}
    </motion.div>
  )
}
