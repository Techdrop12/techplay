'use client'

import { Pack } from '@/types/product'
import PackCard from '@/components/PackCard'
import { motion } from 'framer-motion'

interface Props {
  packs: Pack[]
}

export default function PacksSection({ packs }: Props) {
  if (!packs.length) {
    return (
      <div
        className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500 dark:text-gray-400"
        role="status"
        aria-live="polite"
      >
        Aucun pack recommandé actuellement.
      </div>
    )
  }

  return (
    <section
      className="max-w-6xl mx-auto px-4 py-12"
      aria-labelledby="packs-section-heading"
    >
      <h2
        id="packs-section-heading"
        className="text-2xl font-bold mb-6 text-center text-brand dark:text-brand-light"
      >
        Nos Packs Recommandés
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        role="list"
      >
        {packs.map((pack) => (
          <PackCard key={pack.slug} pack={pack} />
        ))}
      </motion.div>
    </section>
  )
}
