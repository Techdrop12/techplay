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
        className="max-w-6xl mx-auto px-6 py-16 text-center text-gray-500 dark:text-gray-400"
        role="status"
        aria-live="polite"
      >
        Aucun pack recommandé actuellement.
      </div>
    )
  }

  return (
    <section
      className="max-w-6xl mx-auto px-6 py-16"
      aria-labelledby="packs-section-heading"
      role="region"
    >
      <h2
        id="packs-section-heading"
        className="text-3xl font-extrabold mb-10 text-center text-brand dark:text-brand-light"
      >
        Nos Packs Recommandés
      </h2>

      <motion.ul
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10"
        role="list"
      >
        {packs.map((pack) => (
          <li key={pack.slug}>
            <PackCard pack={pack} />
          </li>
        ))}
      </motion.ul>
    </section>
  )
}
