'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
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
  const headingId = useId()
  const subId = `${headingId}-sub`
  const reduceMotion = useReducedMotion()

  const isEmpty = !Array.isArray(packs) || packs.length === 0

  if (isEmpty) {
    return (
      <section className={['max-w-6xl mx-auto px-6 py-16', className].filter(Boolean).join(' ')}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" aria-hidden="true" />
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-token-text/70" role="status" aria-live="polite">
          Chargement des packs recommandés…
        </p>
      </section>
    )
  }

  return (
    <section
      className={['max-w-6xl mx-auto px-6 py-16', className].filter(Boolean).join(' ')}
      aria-labelledby={headingId}
      role="region"
    >
      {/* Header + CTA */}
      <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-center sm:text-left">
          <h2 id={headingId} className="text-3xl font-extrabold text-brand dark:text-white">
            🎁 Nos Packs Recommandés
          </h2>
          <p id={subId} className="mt-2 text-sm text-token-text/70">
            Équipez-vous malin : bundles optimisés pour la perf’ et le budget.
            <span className="sr-only"> {packs.length} packs disponibles.</span>
          </p>
        </div>

        <Link
          href="/pack"
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:bg-[hsl(var(--accent)/.90)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]"
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
        {...(!reduceMotion
          ? { variants: containerVariants, initial: 'hidden', whileInView: 'show' }
          : {})}
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3"
        role="list"
        aria-describedby={subId}
      >
        {packs.map((pack, i) => {
          const key = (pack as any)?.slug ?? (pack as any)?._id ?? `pk-${i}`
          return (
            <motion.li
              key={key}
              {...(!reduceMotion ? { variants: itemVariants } : {})}
              {...(!reduceMotion ? { whileHover: { y: -4 } } : {})}
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
