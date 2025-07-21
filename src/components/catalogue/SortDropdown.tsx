'use client'

type Props = {
  sort: 'asc' | 'desc' | 'alpha'
  setSort: (value: 'asc' | 'desc' | 'alpha') => void
}

export default function SortDropdown({ sort, setSort }: Props) {
  return (
    <div className="w-full md:max-w-xs">
      <label
        htmlFor="sort"
        className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Trier les produits
      </label>
      <select
        id="sort"
        name="sort"
        value={sort}
        onChange={(e) => setSort(e.target.value as 'asc' | 'desc' | 'alpha')}
        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand transition"
        aria-label="Trier les produits"
      >
        <option value="asc">Prix croissant</option>
        <option value="desc">Prix décroissant</option>
        <option value="alpha">Nom (A → Z)</option>
      </select>
    </div>
  )
}
