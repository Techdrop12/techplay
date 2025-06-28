'use client';

import { useState } from 'react';

export default function ProductFilter({ products = [], onFilter }) {
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  const filterAndSort = (category, sort) => {
    let filtered = [...products];

    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    if (sort === 'asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    onFilter(filtered);
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    filterAndSort(category, sortOrder);
  };

  const handleSortChange = (e) => {
    const sort = e.target.value;
    setSortOrder(sort);
    filterAndSort(selectedCategory, sort);
  };

  return (
    <div className="mb-6 flex flex-wrap gap-4 items-center text-sm">
      <label className="flex flex-col">
        <span className="mb-1 font-medium text-gray-700">Catégorie</span>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="border px-3 py-2 rounded bg-white dark:bg-gray-800 dark:text-white"
          aria-label="Filtrer par catégorie"
        >
          <option value="">Toutes catégories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col">
        <span className="mb-1 font-medium text-gray-700">Prix</span>
        <select
          value={sortOrder}
          onChange={handleSortChange}
          className="border px-3 py-2 rounded bg-white dark:bg-gray-800 dark:text-white"
          aria-label="Trier par prix"
        >
          <option value="">Aucun tri</option>
          <option value="asc">Prix croissant</option>
          <option value="desc">Prix décroissant</option>
        </select>
      </label>
    </div>
  );
}
