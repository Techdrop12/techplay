'use client'

import { useState, useEffect } from 'react'
import Fuse from 'fuse.js'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types/product'

interface Props {
  products: Product[]
  query: string
  setQuery: (value: string) => void
}

export default function SearchBar({ products, query, setQuery }: Props) {
  const [results, setResults] = useState<Product[]>([])
  const router = useRouter()

  const fuse = new Fuse(products, {
    keys: ['title', 'description', 'tags'],
    threshold: 0.3,
  })

  useEffect(() => {
    if (query.trim()) {
      const matches = fuse.search(query).slice(0, 5).map(result => result.item)
      setResults(matches)
    } else {
      setResults([])
    }
  }, [query])

  return (
    <div className="relative max-w-md mx-auto w-full">
      <label htmlFor="search" className="sr-only">
        Rechercher un produit
      </label>
      <input
        id="search"
        name="search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 Rechercher un produit..."
        autoComplete="off"
        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand transition"
        aria-label="Recherche de produit"
      />
      {results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 rounded bg-white dark:bg-gray-900 border shadow-lg">
          {results.map((item) => (
            <li
              key={item.slug}
              className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => router.push(`/produit/${item.slug}`)}
            >
              {item.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
