'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'

import type { KeyboardEvent, RefCallback } from 'react'

import { error as logError } from '@/lib/logger'


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
      logError('Erreur de chargement des FAQs', error)
      setFaqs([
        {
          _id: '1',
          question: 'Quels sont les délais de livraison ?',
          answer: 'Livraison en 48 à 72 h ouvrées. Livraison offerte dès 49 € d’achat.',
        },
        {
          _id: '2',
          question: 'Puis-je retourner un article ?',
          answer: 'Oui. Retours gratuits sous 30 jours : contactez-nous pour obtenir l’étiquette de retour.',
        },
        {
          _id: '3',
          question: 'Le paiement est-il sécurisé ?',
          answer: 'Oui. Paiement par Stripe (CB, Apple Pay, Google Pay). Données cryptées.',
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
    <section className="container-app mx-auto max-w-3xl py-10 sm:py-12" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="heading-section text-center">
        Questions fréquentes
      </h2>
      <p className="mt-3 text-center text-[15px] text-token-text/75 max-w-xl mx-auto">
        Réponses rapides sur les commandes, livraisons et retours. Une question ? <a href="/contact" className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline">Nous contacter</a>.
      </p>

      {/* Barre outils */}
      <div className="mt-6 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <input
          type="search"
          inputMode="search"
          placeholder="Rechercher une question…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-2/3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2"
          aria-label="Rechercher dans la FAQ"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="rounded-xl bg-[hsl(var(--accent))] text-white px-3.5 py-2.5 text-sm font-semibold hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            Tout ouvrir
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3.5 py-2.5 text-sm text-token-text hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            Tout fermer
          </button>
        </div>
      </div>

      {/* État chargement / vide */}
      {loading && (
        <div className="space-y-3" role="status" aria-live="polite" aria-busy="true">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-14 rounded-xl bg-[hsl(var(--surface-2))] animate-pulse" />
          ))}
        </div>
      )}

      {!loading && filteredFaqs.length === 0 && (
        <p className="text-center text-token-text/60 text-[15px]" role="status">
          Aucun résultat pour « “{search} ». <a href="/contact" className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline">Nous contacter</a>.
        </p>
      )}

      {/* Liste FAQ */}
      <div role="list" aria-live="polite" className="divide-y divide-[hsl(var(--border))]">
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
                className="w-full text-left flex items-start justify-between gap-4 text-[15px] sm:text-base font-semibold text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--accent))] rounded-md py-1"
                onClick={() => toggleIndex(i)}
                onKeyDown={(e) => onKeyNav(e, i)}
              >
                <span>{faq.question}</span>
                <span
                  className="shrink-0 rounded-md bg-[hsl(var(--surface-2))] px-2 py-0.5 text-xs text-token-text/70"
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
                    <div className="pt-3 text-[14px] leading-relaxed text-token-text/80">
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
           
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
    </section>
  )
}
