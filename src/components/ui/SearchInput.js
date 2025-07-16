'use client';

import { useState } from 'react';

export default function SearchInput({ onSearch, placeholder = 'Recherche...' }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="search"
        aria-label="Rechercher"
        className="flex-grow border rounded px-3 py-2"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Rechercher
      </button>
    </form>
  );
}
