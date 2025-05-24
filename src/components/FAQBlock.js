'use client'

import { useEffect, useState } from 'react'

export default function FAQBlock({ productId }) {
  const [faq, setFaq] = useState([])

  useEffect(() => {
    if (!productId) return
    fetch(`/api/faq/${productId}`)
      .then(res => res.json())
      .then(setFaq)
      .catch(() => setFaq([]))
  }, [productId])

  if (faq.length === 0) return null

  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold mb-2">FAQ produit</h2>
      <ul className="space-y-2">
        {faq.map(({ question, answer }, i) => (
          <li key={i} className="border p-3 rounded">
            <strong>{question}</strong>
            <p>{answer}</p>
          </li>
        ))}
      </ul>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faq.map(({ question, answer }) => ({
              "@type": "Question",
              "name": question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": answer,
              }
            }))
          }),
        }}
      />
    </section>
  )
}
