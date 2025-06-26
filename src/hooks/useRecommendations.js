// ✅ src/hooks/useRecommendations.js

import { useEffect, useState } from 'react';

export default function useRecommendations(category, excludeIds = []) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!category) return;
    fetch(
      `/api/products/recommendations?category=${encodeURIComponent(category)}&excludeIds=${excludeIds.join(',')}`
    )
      .then((res) => res.json())
      .then(setRecommendations)
      .catch(() => setRecommendations([]));
  }, [category, excludeIds]);

  return recommendations;
}
