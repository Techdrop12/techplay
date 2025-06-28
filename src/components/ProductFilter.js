// ✅ /src/components/ProductFilter.js (filtre produits, UX shop)
'use client';

import { useState } from 'react';

export default function ProductFilter({ categories, onChange }) {
  const [cat, setCat] = useState('');
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <select
        value={cat}
        onChange={e => {
          setCat(e.target.value);
          onChange(e.target.value);
        }}
        className="border p-2 rounded"
      >
        <option value="">Toutes les catégories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
