'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    if (query.length < 2) return setResults([])

    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(setResults)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  return (
    <div className="p-4 max-w-xl mx-auto">
      <Input
        type="text"
        placeholder="Rechercher un produit..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="mb-4"
      />

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((product) => (
            <Card key={product._id}>
              <CardContent>
                <Link href={`/produit/${product.slug}`} className="block hover:underline">
                  {product.title} - {product.price} €
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
