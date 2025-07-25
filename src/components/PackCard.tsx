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
      whileHover={{ scale: 1.04, boxShadow: '0 15px 30px rgba(0,0,0,0.2)' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="group rounded-3xl border bg-white dark:bg-zinc-900 shadow-md hover:shadow-2xl transition overflow-hidden focus-within:ring-4 focus-within:ring-blue-500"
      aria-label={`Voir le pack : ${pack.title}`}
      data-pack-id={pack.slug}
      role="listitem"
      tabIndex={0}
    >
      <Link href={`/pack/${pack.slug}`} className="block focus:outline-none" prefetch={false}>
        <div className="relative w-full h-60 sm:h-72 rounded-t-3xl overflow-hidden">
          <Image
            src={pack.image || '/placeholder.png'}
            alt={`Image du pack ${pack.title}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
        </div>

        <div className="p-6">
          <h3 className="text-lg sm:text-xl font-semibold line-clamp-2 text-gray-900 dark:text-white">
            {pack.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mt-2">
            {pack.description}
          </p>
          <div className="mt-4 font-bold text-brand text-lg sm:text-xl">
            {formatPrice(pack.price)}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
