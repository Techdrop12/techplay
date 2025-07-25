'use client'

import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import WishlistButton from '@/components/WishlistButton'
import StarsRating from '@/components/StarsRating'
import ProductTags from '@/components/ProductTags'
import { Pack } from '@/types/product'
import { motion } from 'framer-motion'

interface Props {
  pack: Pack
}

export default function PackDetails({ pack }: Props) {
  const {
    _id,
    title,
    price,
    oldPrice,
    rating,
    image,
    slug,
    description,
    tags,
  } = pack

  return (
    <motion.section
      className="grid md:grid-cols-2 gap-8"
      data-pack-id={slug}
      aria-labelledby="pack-title"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Image */}
      <div className="relative w-full h-80 md:h-[30rem] rounded-xl overflow-hidden border">
        <Image
          src={image ?? '/placeholder.png'}
          alt={`Image du pack ${title}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Détails */}
      <div className="flex flex-col justify-center">
        <h1
          id="pack-title"
          className="text-3xl font-bold mb-4 tracking-tight"
        >
          {title}
        </h1>

        {/* Prix & Ancien prix */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-brand text-xl font-semibold">
            {formatPrice(price)}
          </span>
          {oldPrice && (
            <span className="line-through text-gray-500 text-lg">
              {formatPrice(oldPrice)}
            </span>
          )}
        </div>

        {/* Étoiles si rating dispo */}
        {typeof rating === 'number' && (
          <div className="mb-4">
            <StarsRating rating={rating} />
          </div>
        )}

        {/* Wishlist */}
        <div className="my-4">
          <WishlistButton
            product={{
              _id,
              title,
              price,
              image: image ?? '/placeholder.png',
              slug,
            }}
          />
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        )}

        {/* Tags si présents */}
        {tags && <ProductTags tags={tags} />}
      </div>
    </motion.section>
  )
}
