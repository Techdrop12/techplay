'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Pack } from '@/types/product'

interface PackCardProps {
  pack: Pack
}

export default function PackCard({ pack }: PackCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="group rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition overflow-hidden"
      aria-label={`Voir le pack : ${pack.title}`}
      data-pack-id={pack.slug}
      role="listitem"
    >
      <Link
        href={`/pack/${pack.slug}`}
        className="block focus:outline-none"
        prefetch={false}
      >
        <div className="relative w-full h-52 sm:h-60">
          <Image
            src={pack.image || '/placeholder.png'}
            alt={`Image du pack ${pack.title}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </div>

        <div className="p-4">
          <h3 className="text-base sm:text-lg font-semibold line-clamp-2">
            {pack.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mt-1">
            {pack.description}
          </p>
          <div className="mt-2 font-bold text-brand text-sm sm:text-base">
            {formatPrice(pack.price)}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
