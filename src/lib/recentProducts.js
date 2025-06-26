// ✅ src/lib/recentProducts.js

export function getRecentlyViewed() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  } catch {
    return [];
  }
}
