// ✅ /src/lib/recentProducts.js (produits vus récemment, helper universel)
export function getRecentlyViewed() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  } catch {
    return [];
  }
}

export function addRecentlyViewed(product) {
  if (typeof window === 'undefined') return;
  try {
    const viewed = getRecentlyViewed();
    if (!viewed.some((p) => p._id === product._id)) {
      const updated = [...viewed, product].slice(-8);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    }
  } catch {}
}
