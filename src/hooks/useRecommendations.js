// ✅ /src/hooks/useRecommendations.js (hook produits recommandés, bonus A/B)
import { useState, useEffect } from 'react';

export default function useRecommendations(category, excludeId) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!category) return;
    fetch(`/api/products/recommendations?category=${encodeURIComponent(category)}&excludeId=${excludeId}`)
      .then((res) => res.ok ? res.json() : [])
      .then(setRecommendations)
      .catch(() => setRecommendations([]));
  }, [category, excludeId]);

  return recommendations;
}
