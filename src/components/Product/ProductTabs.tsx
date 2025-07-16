'use client'
import { useState } from 'react'

export default function ProductTabs({
  description,
  specs,
}: {
  description: string
  specs: string[]
}) {
  const [tab, setTab] = useState<'description' | 'specs'>('description')

  return (
    <div className="mt-8">
      <div className="flex gap-4 mb-4 border-b">
        <button
          className={`pb-2 ${tab === 'description' ? 'border-b-2 border-brand font-semibold' : ''}`}
          onClick={() => setTab('description')}
        >
          Description
        </button>
        <button
          className={`pb-2 ${tab === 'specs' ? 'border-b-2 border-brand font-semibold' : ''}`}
          onClick={() => setTab('specs')}
        >
          Caractéristiques
        </button>
      </div>
      {tab === 'description' && <p>{description}</p>}
      {tab === 'specs' && (
        <ul className="list-disc pl-5 space-y-1">
          {specs.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
