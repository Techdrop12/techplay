'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import type { Pack } from '@/types/product'

import AddToCartButton from '@/components/AddToCartButton'
import ProductTags from '@/components/ProductTags'
import StarsRating from '@/components/StarsRating'
import WishlistButton from '@/components/WishlistButton'
import { safeProductImageUrl } from '@/lib/safeProductImage'
import { formatPrice } from '@/lib/utils'


interface Props {
  pack: Pack
}

export default function PackDetails({ pack }: Props) {
  const t = useTranslations('pack')
  const {
    _id,
    title = 'Pack',
    price = 0,
    oldPrice,
    rating = 0,
    image = '/placeholder.png',
    slug,
    description = '',
    tags = [],
  } = pack ?? {}

  return (
    <motion.section
      className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4 py-12"
      data-pack-id={_id}
      aria-labelledby="pack-title"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Image */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-[hsl(var(--border))] shadow-[var(--shadow-md)]">
        <Image
          src={safeProductImageUrl(image)}
          alt={t('image_alt', { title })}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          placeholder="blur"
          blurDataURL="/placeholder-blur.png"
        />
      </div>

      {/* Détails */}
      <div className="flex flex-col justify-center space-y-6">
        <h1
          id="pack-title"
          className="text-4xl font-bold text-[hsl(var(--text))] tracking-tight"
        >
          {title}
        </h1>

        {/* Prix */}
        <div className="flex items-center gap-4">
          <span className="text-2xl font-semibold text-[hsl(var(--accent))]">
            {formatPrice(price)}
          </span>
          {oldPrice && (
            <span className="line-through text-token-text/60 text-lg">
              {formatPrice(oldPrice)}
            </span>
          )}
        </div>

        {/* Étoiles */}
        {rating > 0 && (
          <StarsRating rating={rating} aria-label={t('rating_aria', { rating })} />
        )}

        {/* Wishlist */}
        <WishlistButton
          product={{
            _id,
            slug,
            title,
            price,
            image,
          }}
          floating={false}
        />

        <AddToCartButton
          product={{
            _id,
            slug: slug ?? _id,
            title,
            price,
            image: safeProductImageUrl(image),
            quantity: 1,
          }}
          fullWidth
          idleText={t('add_pack_to_cart')}
        />

        {/* Description */}
        {description && (
          <p className="text-token-text/85 text-lg leading-relaxed whitespace-pre-line">
            {description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && <ProductTags tags={tags} />}
      </div>
    </motion.section>
  )
}
