'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface FAQItem {
  _id: string
  question: string
  answer: string
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const faqRefs = useRef<Array<HTMLButtonElement | null>>([])

  const fetchFAQs = useCallback(async () => {
    try {
      const res = await fetch('/api/faq')
      if (!res.ok) throw new Error('Erreur API')
      const data = await res.json()
      setFaqs(data)
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
    }
  }, [])

  useEffect(() => {
    fetchFAQs()
  }, [fetchFAQs])

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-12" aria-label="Foire aux questions">
      <h2 className="text-2xl font-bold mb-6 text-center">FAQ</h2>
      <div role="list" aria-live="polite">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <div key={faq._id} className="border-b border-gray-300 dark:border-gray-700 py-4">
              <button
                ref={(el: HTMLButtonElement | null) => {
                  faqRefs.current[index] = el
                }}
                id={`faq-header-${faq._id}`}
                aria-controls={`faq-panel-${faq._id}`}
                aria-expanded={isOpen}
                className="w-full text-left font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => toggleIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    const nextIndex = (index + 1) % faqs.length
                    faqRefs.current[nextIndex]?.focus()
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    const prevIndex = (index - 1 + faqs.length) % faqs.length
                    faqRefs.current[prevIndex]?.focus()
                  }
                }}
              >
                {faq.question}
              </button>
              <div
                id={`faq-panel-${faq._id}`}
                role="region"
                aria-labelledby={`faq-header-${faq._id}`}
                className={`mt-2 text-sm text-gray-600 dark:text-gray-400 overflow-hidden transition-all duration-300 ${
                  isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {isOpen && <p>{faq.answer}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
