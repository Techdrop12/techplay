'use client'
import { useState } from 'react'

const faqs = [
  {
    question: 'Quels sont les délais de livraison ?',
    answer: 'La majorité des commandes sont livrées en 48 à 72h ouvrées.',
  },
  {
    question: 'Puis-je retourner un article ?',
    answer: 'Oui, vous avez 14 jours pour changer d’avis et demander un remboursement.',
  },
  {
    question: 'Les paiements sont-ils sécurisés ?',
    answer: 'Oui, les paiements sont 100% sécurisés via Stripe ou PayPal.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center">FAQ</h2>
      {faqs.map((faq, index) => (
        <div key={index} className="border-b border-gray-300 py-4">
          <button
            className="w-full text-left font-semibold text-gray-800 dark:text-gray-200"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
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
