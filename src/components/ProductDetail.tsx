'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [imgError, setImgError] = useState(false)
  const viewedRef = useRef(false)
  const sectionRef = useRef<HTMLElement | null>(null)

  const {
    _id,
    slug = '',
    title = 'Produit',
    price = 0,
    oldPrice,
    image = '/placeholder.png',
    description = '',
    rating,
    isNew,
    isBestSeller,
    tags,
  } = product ?? {}

  const hasRating = typeof rating === 'number' && !Number.isNaN(rating)
  const discount =
    oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null

  // Log "vue fiche produit" une seule fois
  useEffect(() => {
    if (!sectionRef.current || viewedRef.current) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          viewedRef.current = true
          logEvent({
            action: 'product_detail_view',
            category: 'engagement',
            label: title,
            value: price,
          })
        }
      },
      { threshold: 0.35 }
    )
    io.observe(sectionRef.current)
    return () => io.disconnect()
  }, [title, price])

  const handleAdd = () => {
    logEvent({
      action: 'add_to_cart',
      category: 'ecommerce',
      label: title,
      value: price * quantity,
    })
  }

  const jsonLd = useMemo(() => {
    const data: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      image: [image],
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: price.toFixed(2),
        availability: 'https://schema.org/InStock',
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
    }
    if (hasRating) {
      data.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: rating!.toFixed(1),
        reviewCount: 12,
      }
    }
    return data
  }, [title, image, price, hasRating, rating])

  return (
    <motion.section
      ref={sectionRef}
      className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto px-4 py-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      aria-labelledby="product-title"
      data-product-id={_id}
      data-product-slug={slug}
      role="region"
      aria-live="polite"
      itemScope
      itemType="https://schema.org/Product"
    >
      {/* 📸 Image produit */}
      <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
        <Image
          src={imgError ? '/placeholder.png' : image}
          alt={`Image du produit ${title}`}
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
          placeholder="blur"
          blurDataURL="/placeholder-blur.png"
          onError={() => setImgError(true)}
          itemProp="image"
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
          {discount && (
            <span className="bg-red-600 text-white px-3 py-1 rounded-full font-semibold text-sm shadow-md">
              -{discount}%
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
            itemProp="name"
          >
            {title}
          </h1>

          {/* Note + badge livraison */}
          <div className="mt-3 flex items-center gap-3">
            <RatingStars value={hasRating ? rating! : 4} editable={false} />
            <FreeShippingBadge price={price} minimal />
          </div>

          {/* Bloc prix (lisible + économie) */}
          <div className="mt-4 flex items-end gap-3">
            <span
              className="text-3xl font-extrabold text-brand"
              aria-label={`Prix : ${formatPrice(price)}`}
            >
              {formatPrice(price)}
            </span>
            {oldPrice && (
              <span className="line-through text-gray-400 dark:text-gray-500">
                {formatPrice(oldPrice)}
              </span>
            )}
            {discount && oldPrice && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                Économisez {formatPrice(oldPrice - price)} ({discount}%)
              </span>
            )}
          </div>

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

          <AddToCartButton
            product={{
              _id,
              slug,
              title,
              price,
              image,
              quantity, // AddToCartButton gère défaut + analytics
            }}
            onAdd={handleAdd}
            size="lg"
          />

          <WishlistButton
            product={{ _id, slug, title, price, image }}
            floating={false}
            className="mt-2"
          />
        </div>
      </div>

      {/* Résumé sticky (mobile) */}
      <StickyCartSummary locale={locale} />

      {/* Avis */}
      <div className="lg:col-span-2 mt-12">
        <ReviewForm productId={_id} />
      </div>

      {/* JSON-LD SEO */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </motion.section>
  )
}
