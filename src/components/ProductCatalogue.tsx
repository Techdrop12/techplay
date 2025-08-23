'use client'

import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'

import { Product } from '@/types/product'
import ProductGrid from '@/components/ProductGrid'
import SectionWrapper from '@/components/SectionWrapper'
import SectionTitle from '@/components/SectionTitle'
import SearchBar from '@/components/catalogue/SearchBar'
import FilterPanel from '@/components/catalogue/FilterPanel'
import SortDropdown from '@/components/catalogue/SortDropdown'

import ScrollToTop from '@/components/ScrollToTop'
import BackToTopButton from '@/components/BackToTopButton'
import Analytics from '@/components/Analytics'
import MetaPixel from '@/components/MetaPixel'

type Props = {
  products: Product[]
}

export default function ProductCatalogue({ products }: Props) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setCategory] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<'asc' | 'desc' | 'alpha'>('asc')

  const fuse = useMemo(
    () =>
      new Fuse(products, {
        keys: ['title', 'tags', 'category'],
        threshold: 0.3,
      }),
    [products]
  )

  const filtered = useMemo(() => {
    let results = query ? fuse.search(query).map(r => r.item) : products

    if (selectedCategory) {
      results = results.filter(p => p.category === selectedCategory)
    }

    if (sortOption === 'asc') {
      results = results.sort((a, b) => a.price - b.price)
    } else if (sortOption === 'desc') {
      results = results.sort((a, b) => b.price - a.price)
    } else if (sortOption === 'alpha') {
      results = results.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''))
    }

    return results
  }, [query, products, selectedCategory, sortOption, fuse])

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category ?? 'Autre'))),
    [products]
  )

  return (
    <>
      <Analytics />
      <MetaPixel />
      <ScrollToTop />
      <BackToTopButton />

      <main
        role="main"
        className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
      >
        <SectionWrapper>
          <SectionTitle title="Catalogue TechPlay" />
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <SearchBar query={query} setQuery={setQuery} products={products} />
            <FilterPanel
              categories={categories}
              selected={selectedCategory}
              setSelected={setCategory}
            />
            <SortDropdown sort={sortOption} setSort={setSortOption} />
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
              Aucun produit trouvé.
            </p>
          ) : (
            <ProductGrid products={filtered} />
          )}
        </SectionWrapper>
      </main>
    </>
  )
}
