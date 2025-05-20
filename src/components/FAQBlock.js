'use client'

import { useEffect, useState } from 'react'

export default function FAQBlock({ productId }) {
  const [faq, setFaq] = useState([])

  useEffect(() => {
    fetch(`/api/faq/${productId}`)
      .then(res => res.json())
      .then(setFaq)
  }, [productId])

  if (faq.length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-2">FAQ produit</h2>
      <ul className="space-y-2">
        {faq.map((q, i) => (
          <li key={i} className="border p-3 rounded">
            <strong>{q.question}</strong>
            <p>{q.answer}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
