// ✅ src/components/AIProductSummary.js

'use client';

import { useEffect, useState } from 'react';

export default function AIProductSummary({ product }) {
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (!product) return;
    fetch(`/api/ai/generate-summary?title=${encodeURIComponent(product.title)}&desc=${encodeURIComponent(product.description)}`)
      .then((res) => res.json())
      .then((data) => setSummary(data.summary))
      .catch(() => setSummary(''));
  }, [product]);

  if (!summary) return null;
  return (
    <div className="my-3 bg-blue-50 text-blue-900 p-2 rounded text-sm">
      <strong>Résumé IA :</strong> {summary}
    </div>
  );
}
