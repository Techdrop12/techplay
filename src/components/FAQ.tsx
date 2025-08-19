'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import type { KeyboardEvent, RefCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQItem {
  _id: string
  question: string
  answer: string
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openSet, setOpenSet] = useState<Set<number>>(new Set())
  const headerRefs = useRef<Array<HTMLButtonElement | null>>([])

  const fetchFAQs = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/faq', { cache: 'no-store' })
      if (!res.ok) throw new Error('Erreur API')
      const data = await res.json()
      setFaqs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erreur de chargement des FAQs', error)
      setFaqs([
        {
          _id: '1',
          question: 'Quels sont les délais de livraison ?',
          answer: 'La majorité des commandes sont livrées en 48 à 72h ouvrées.',
        },
        {
          _id: '2',
          question: 'Puis-je retourner un article ?',
          answer: 'Oui, vous avez 14 jours pour changer d’avis et demander un remboursement.',
        },
        {
          _id: '3',
          question: 'Les paiements sont-ils sécurisés ?',
          answer: 'Oui, les paiements sont 100% sécurisés via Stripe ou PayPal.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFAQs()
  }, [fetchFAQs])

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return faqs
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    )
  }, [faqs, search])

  const toggleIndex = (index: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const expandAll = () => setOpenSet(new Set(filteredFaqs.map((_, i) => i)))
  const collapseAll = () => setOpenSet(new Set())

  const onKeyNav = (e: KeyboardEvent, i: number) => {
    const total = filteredFaqs.length
    if (!total) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      headerRefs.current[(i + 1) % total]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      headerRefs.current[(i - 1 + total) % total]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      headerRefs.current[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      headerRefs.current[total - 1]?.focus()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleIndex(i)
    }
  }

  // ✅ ref callback qui retourne void (TypeScript OK)
  const setHeaderRef = (idx: number): RefCallback<HTMLButtonElement> => (el) => {
    headerRefs.current[idx] = el
  }

  // JSON-LD SEO (FAQPage)
  const faqJsonLd = useMemo(() => {
    if (!filteredFaqs.length) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: filteredFaqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    }
  }, [filteredFaqs])

  return (
    <section className="max-w-3xl mx-auto px-4 py-16" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-3xl font-extrabold mb-6 text-center">
        FAQ
      </h2>

      {/* Barre outils */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <input
          type="search"
          inputMode="search"
          placeholder="Rechercher une question…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-2/3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Rechercher dans la FAQ"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="rounded-md bg-accent text-white px-3 py-2 text-sm font-semibold hover:bg-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
          >
            Tout ouvrir
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="rounded-md bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
          >
            Tout fermer
          </button>
        </div>
      </div>

      {/* État chargement / vide */}
      {loading && (
        <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-16 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && filteredFaqs.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400" role="status">
          Aucun résultat pour “{search}”.
        </p>
      )}

      {/* Liste FAQ */}
      <div role="list" aria-live="polite" className="divide-y divide-gray-200 dark:divide-gray-800">
        {filteredFaqs.map((faq, i) => {
          const isOpen = openSet.has(i)
          const headerId = `faq-header-${faq._id}-${i}`
          const panelId = `faq-panel-${faq._id}-${i}`

          return (
            <div key={faq._id} className="py-4">
              {/* ✅ commentaire déplacé en dehors de la balise */}
              {/* corrige la signature de ref */}
              <button
                ref={setHeaderRef(i)}
                id={headerId}
                aria-controls={panelId}
                aria-expanded={isOpen}
                className="w-full text-left flex items-start justify-between gap-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                onClick={() => toggleIndex(i)}
                onKeyDown={(e) => onKeyNav(e, i)}
              >
                <span>{faq.question}</span>
                <span
                  className="shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs text-gray-600 dark:text-gray-300"
                  aria-hidden="true"
                >
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={headerId}
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* SEO JSON-LD */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
    </section>
  )
}
