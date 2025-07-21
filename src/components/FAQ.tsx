'use client'

import { useEffect, useState } from 'react'

interface FAQItem {
  _id: string
  question: string
  answer: string
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await fetch('/api/faq')
        if (!res.ok) throw new Error('Erreur API')
        const data = await res.json()
        setFaqs(data)
      } catch (error) {
        console.error('Erreur de chargement des FAQs', error)
        // Fallback local si erreur
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
    }

    fetchFAQs()
  }, [])

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center">FAQ</h2>
      {faqs.map((faq, index) => (
        <div key={faq._id} className="border-b border-gray-300 py-4">
          <button
            className="w-full text-left font-semibold text-gray-800 dark:text-gray-200 focus:outline-none"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            aria-expanded={openIndex === index}
          >
            {faq.question}
          </button>
          {openIndex === index && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{faq.answer}</p>
          )}
        </div>
      ))}
    </section>
  )
}
