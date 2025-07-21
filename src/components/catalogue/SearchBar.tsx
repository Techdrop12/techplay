'use client'

interface Props {
  query: string
  setQuery: (value: string) => void
}

export default function SearchBar({ query, setQuery }: Props) {
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
    </div>
  )
}
