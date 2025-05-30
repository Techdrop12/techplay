const STORAGE_KEY = 'recentProducts';

export function getRecentProducts() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function addRecentProduct(product) {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecentProducts();
    const filtered = current.filter(p => p.slug !== product.slug);
    const updated = [product, ...filtered].slice(0, 6);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
