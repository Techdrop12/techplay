'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
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
import { trackViewItem } from '@/lib/ga'

interface Props {
  product: Product
  locale?: string
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

export default function ProductDetail({ product, locale = 'fr' }: Props) {
  const prefersReducedMotion = useReducedMotion()

  const [quantity, setQuantity] = useState<number>(1)
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
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
    typeof oldPrice === 'number' && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null

  const productUrl = useMemo(() => (slug ? `/produit/${slug}` : '#'), [slug])
  const priceStr = useMemo(() => price.toFixed(2), [price])

  // Log “vue fiche produit” + GA4 view_item une seule fois quand visible
  useEffect(() => {
    if (!sectionRef.current || viewedRef.current) return
    const el = sectionRef.current
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !viewedRef.current) {
          viewedRef.current = true
          try {
            logEvent({
              action: 'product_detail_view',
              category: 'engagement',
              label: title,
              value: price,
            })
          } catch {}
          try {
            trackViewItem({
              currency: 'EUR',
              value: price,
              items: [
                {
                  item_id: _id,
                  item_name: title,
                  price,
                  quantity: 1,
                },
              ],
            })
          } catch {}
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [_id, title, price])

  const handleAdd = useCallback(() => {
    try {
      logEvent({
        action: 'add_to_cart',
        category: 'ecommerce',
        label: title,
        value: price * quantity,
      })
    } catch {}
  }, [title, price, quantity])

  // JSON-LD (Product + Offer)
  const jsonLd = useMemo(() => {
    const data: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      image: [image],
      description: description || undefined,
      sku: _id,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: price.toFixed(2),
        availability: 'https://schema.org/InStock',
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        itemCondition: 'https://schema.org/NewCondition',
      },
    }
    if (hasRating) {
      data.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: rating!.toFixed(1),
        reviewCount: 12, // remplace par ta vraie donnée si dispo
      }
    }
    return data
  }, [_id, title, image, description, price, hasRating, rating])

  return (
    <motion.section
      ref={sectionRef}
      className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto px-4 py-12"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
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
          onLoadingComplete={() => setImgLoaded(true)}
          itemProp="image"
          draggable={false}
        />
        {!imgLoaded && (
          <div
            className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200/70 to-gray-100/40 dark:from-zinc-800/60 dark:to-zinc-900/40"
            aria-hidden="true"
          />
        )}
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

          {/* Bloc prix */}
          <div className="mt-4 flex flex-wrap items-end gap-3" aria-live="polite">
            <span
              className="text-3xl font-extrabold text-brand"
              aria-label={`Prix : ${formatPrice(price)}`}
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <meta itemProp="priceCurrency" content="EUR" />
              <meta itemProp="price" content={priceStr} />
              {formatPrice(price)}
            </span>
            {typeof oldPrice === 'number' && (
              <span className="line-through text-gray-400 dark:text-gray-500">
                {formatPrice(oldPrice)}
              </span>
            )}
            {discount && typeof oldPrice === 'number' && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                Économisez {formatPrice(oldPrice - price)} ({discount}%)
              </span>
            )}
          </div>

          {description && (
            <p className="mt-6 text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-lg" itemProp="description">
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
              onChange={(q) => setQuantity(clamp(q, 1, 99))}
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
