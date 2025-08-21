'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useId } from 'react'
import PackCard from '@/components/PackCard'
import type { Pack } from '@/types/product'

interface Props {
  packs: Pack[]
  /** Classe optionnelle */
  className?: string
}

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function PacksSection({ packs, className }: Props) {
  const isEmpty = !packs || packs.length === 0
  const headingId = useId()
  const subId = `${headingId}-sub`

  if (isEmpty) {
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
      className={['max-w-6xl mx-auto px-6 py-16', className].filter(Boolean).join(' ')}
      aria-labelledby={headingId}
      role="region"
    >
      {/* Header + CTA */}
      <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h2
            id={headingId}
            className="text-3xl font-extrabold text-brand dark:text-brand-light animate-fadeIn"
          >
            🎁 Nos Packs Recommandés
          </h2>
          <p id={subId} className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Équipez-vous malin : bundles optimisés pour la perf’ et le budget.
            <span className="sr-only"> {packs.length} packs disponibles.</span>
          </p>
        </div>

        <Link
          href="/pack"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 transition"
          aria-label="Voir tous les packs TechPlay"
        >
          Voir tous les packs
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-90">
            <path fill="currentColor" d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
          </svg>
        </Link>
      </div>

      {/* Grid */}
      <motion.ul
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
        role="list"
        aria-describedby={subId}
      >
        {packs.map((pack, i) => {
          const key = (pack as any)?.slug ?? (pack as any)?._id ?? i
          return (
            <motion.li
              key={key}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <PackCard pack={pack} />
            </motion.li>
          )
        })}
      </motion.ul>
    </section>
  )
}
