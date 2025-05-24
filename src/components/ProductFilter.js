'use client'

import { useState } from 'react'

export default function ProductFilter({ products, onFilter }) {
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortPrice, setSortPrice] = useState('')

  const handleFilterChange = (category) => {
    setSelectedCategory(category)
    filterAndSort(category, sortPrice)
  }

  const handleSortChange = (sort) => {
    setSortPrice(sort)
    filterAndSort(selectedCategory, sort)
  }

  const filterAndSort = (category, sort) => {
    let filtered = products

    if (category) {
      filtered = filtered.filter(p => p.category === category)
    }

    if (sort === 'asc') {
      filtered = filtered.slice().sort((a, b) => a.price - b.price)
    } else if (sort === 'desc') {
      filtered = filtered.slice().sort((a, b) => b.price - a.price)
    }

    onFilter(filtered)
  }

  return (
    <div className="mb-6 flex flex-wrap gap-4 items-center">
      <select
        value={selectedCategory}
        onChange={e => handleFilterChange(e.target.value)}
        className="border rounded px-3 py-2"
      >
        <option value="">Toutes catégories</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <select
        value={sortPrice}
        onChange={e => handleSortChange(e.target.value)}
        className="border rounded px-3 py-2"
      >
        <option value="">Trier par prix</option>
        <option value="asc">Prix croissant</option>
        <option value="desc">Prix décroissant</option>
      </select>
    </div>
  )
}
