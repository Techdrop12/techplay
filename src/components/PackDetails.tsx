'use client'

import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import WishlistButton from '@/components/WishlistButton'
import StarsRating from '@/components/StarsRating'
import ProductTags from '@/components/ProductTags'
import type { Pack } from '@/types/product'
import { motion } from 'framer-motion'

interface Props {
  pack: Pack
}

export default function PackDetails({ pack }: Props) {
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
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md">
        <Image
          src={image}
          alt={`Image du pack ${title}`}
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
          className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight"
        >
          {title}
        </h1>

        {/* Prix */}
        <div className="flex items-center gap-4">
          <span className="text-brand text-2xl font-semibold">
            {formatPrice(price)}
          </span>
          {oldPrice && (
            <span className="line-through text-gray-500 text-lg">
              {formatPrice(oldPrice)}
            </span>
          )}
        </div>

        {/* Étoiles */}
        {rating > 0 && (
          <StarsRating rating={rating} aria-label={`Note : ${rating} étoiles`} />
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

        {/* Description */}
        {description && (
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line">
            {description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && <ProductTags tags={tags} />}
      </div>
    </motion.section>
  )
}
