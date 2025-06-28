// ✅ /src/components/AIProductSummary.js (bonus AI : résumé automatique produit)
'use client';

import { useEffect, useState } from 'react';

export default function AIProductSummary({ productId }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetch(`/api/ai/generate-summary?id=${productId}`)
      .then(res => res.json())
      .then(data => setSummary(data.summary))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <p className="animate-pulse text-gray-500">Résumé IA en cours…</p>;
  if (!summary) return null;
  return (
    <div className="mt-4 p-4 bg-blue-50 rounded shadow">
      <p className="text-blue-900">{summary}</p>
    </div>
  );
}
