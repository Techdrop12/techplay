'use client'

import { useEffect, useState } from 'react'

export default function AIProductSummary({ description }) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!description) return

    setLoading(true)
    fetch('/api/ai/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.summary) {
          setSummary(data.summary)
          setError(null)
        } else {
          setError('Pas de résumé disponible')
        }
      })
      .catch(() => setError('Erreur de génération'))
      .finally(() => setLoading(false))
  }, [description])

  if (loading) return <p>Génération du résumé…</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!summary) return null

  return (
    <p className="mb-4 italic text-gray-700">{summary}</p>
  )
}
