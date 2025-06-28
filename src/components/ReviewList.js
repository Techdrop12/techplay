// ✅ /src/components/ReviewList.js (liste avis, tri, filtre, badge, bonus UX/SEO)
'use client';

import { useEffect, useState } from 'react';
import ScoreStars from './ScoreStars';

function formatDate(date, locale = 'fr') {
  return new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ReviewList({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState(null);

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setReviews(data || []));
  }, [productId]);

  if (!reviews.length) return <p className="text-gray-500 mt-4">Aucun avis pour ce produit.</p>;

  const filtered = filter ? reviews.filter(r => r.note === filter) : reviews;

  return (
    <div className="my-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold">Avis&nbsp;:</span>
        {[5, 4, 3, 2, 1].map(n => (
          <button
            key={n}
            className={`px-2 py-1 rounded ${filter === n ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter(filter === n ? null : n)}
          >
            {n}★
          </button>
        ))}
      </div>
      <ul className="space-y-4">
        {filtered.map(r => (
          <li key={r._id} className="border-b pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ScoreStars value={r.note} />
              <span className="text-xs text-gray-500">{formatDate(r.createdAt)}</span>
              {r.verified && (
                <span className="ml-2 inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">Avis vérifié</span>
              )}
            </div>
            <div className="italic text-gray-700">{r.comment}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
