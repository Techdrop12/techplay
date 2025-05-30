'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const defaultFaq = [
  {
    question: 'Quel est le délai de livraison ?',
    answer: 'La livraison prend généralement entre 3 et 5 jours ouvrés.',
  },
  {
    question: 'Puis-je retourner le produit ?',
    answer: 'Oui, vous disposez de 14 jours pour retourner le produit après réception.',
  },
  {
    question: 'Comment fonctionne la garantie ?',
    answer: 'Tous nos produits bénéficient d’une garantie constructeur de 1 an minimum.',
  },
]

export default function FAQBlock({ faq = defaultFaq }) {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4">Questions fréquentes</h3>
      <ul className="space-y-2">
        {faq.map((item, index) => (
          <li key={index} className="border rounded">
            <button
              onClick={() => toggle(index)}
              className="w-full text-left px-4 py-2 font-medium hover:bg-gray-100"
            >
              {item.question}
            </button>
            <AnimatePresence initial={false}>
              {openIndex === index && (
                <motion.div
                  key="faq-answer"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-50 overflow-hidden"
                >
                  {item.answer}
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </div>
  )
}
