'use client'

import { useEffect, useState } from 'react'
import { getRecommendedPacks } from '@/lib/data'
import { Pack } from '@/types/product'
import PackCard from '@/components/PackCard'
import { motion } from 'framer-motion'

export default function PacksSection() {
  const [packs, setPacks] = useState<Pack[]>([])

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const res = await getRecommendedPacks()
        setPacks(res || [])
      } catch (err) {
        console.error('Erreur récupération packs recommandés :', err)
      }
    }

    fetchPacks()
  }, [])

  if (!packs.length) return null

  return (
    <section
      className="max-w-6xl mx-auto px-4 py-12"
      aria-labelledby="packs-section-heading"
    >
      <h2
        id="packs-section-heading"
        className="text-2xl font-bold mb-6 text-center"
      >
        Nos Packs Recommandés
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
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
