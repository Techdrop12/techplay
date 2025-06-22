'use client';

import Fuse from 'fuse.js';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ products }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const router = useRouter();

  const fuse = new Fuse(products, {
    keys: ['title', 'description', 'tags'],
    threshold: 0.3,
  });

  useEffect(() => {
    if (query.trim()) {
      setResults(fuse.search(query).slice(0, 5));
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="relative max-w-md mx-auto">
      <input
        type="text"
        placeholder="Rechercher un produit..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />
      {results.length > 0 && (
        <ul className="absolute bg-white border rounded w-full mt-2 z-50 shadow-lg">
          {results.map(({ item }) => (
            <li key={item.slug} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => router.push(`/produit/${item.slug}`)}>
              {item.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
