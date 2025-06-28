// ✅ src/components/AIProductSummary.js
'use client';

import { useEffect, useState } from 'react';

export default function AIProductSummary({ product }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!product?.description) return;

    setLoading(true);
    setError(null);

    fetch('/api/ai/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: product.title,
        description: product.description,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.summary) {
          setSummary(data.summary);
        } else {
          setError("Résumé non disponible.");
        }
      })
      .catch(() => setError("Erreur lors de la génération du résumé."))
      .finally(() => setLoading(false));
  }, [product]);

  if (loading) {
    return <p className="text-sm italic text-gray-500 animate-pulse">Génération du résumé IA…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (!summary) return null;

  return (
    <div className="mt-3 p-3 rounded bg-blue-50 text-blue-900 text-sm shadow-sm">
      <strong>Résumé IA :</strong> {summary}
    </div>
  );
}
