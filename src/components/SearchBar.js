// ✅ src/components/SearchBar.js

'use client';

import { useState, useEffect } from 'react';
import Fuse from 'fuse.js';

export default function SearchBar({ products }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [fuse, setFuse] = useState(null);

  useEffect(() => {
    if (products?.length) {
      setFuse(
        new Fuse(products, {
          keys: ['title', 'description', 'category'],
          threshold: 0.3,
        })
      );
    }
  }, [products]);

  useEffect(() => {
    if (!fuse || !query) {
      setResults([]);
      return;
    }
    setResults(fuse.search(query).map((r) => r.item));
  }, [query, fuse]);

  return (
    <div className="w-full max-w-md mx-auto my-4">
      <input
        className="w-full border p-2 rounded shadow"
        placeholder="Rechercher un produit…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <ul className="bg-white border rounded shadow mt-1 max-h-60 overflow-y-auto">
          {results.length === 0 && (
            <li className="p-2 text-gray-500">Aucun résultat</li>
          )}
          {results.map((p) => (
            <li key={p._id} className="p-2 border-b last:border-b-0">
              <a href={`/produit/${p.slug}`} className="text-blue-700 hover:underline">
                {p.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
