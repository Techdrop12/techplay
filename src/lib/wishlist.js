// ✅ /src/lib/wishlist.js (helper universel, SSR et client)
export function getWishlist() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
  } catch {
    return [];
  }
}

export function addToWishlist(product) {
  if (typeof window === 'undefined') return;
  try {
    const list = getWishlist();
    if (!list.find((item) => item._id === product._id)) {
      localStorage.setItem('wishlist', JSON.stringify([...list, product]));
    }
  } catch {}
}

export function removeFromWishlist(id) {
  if (typeof window === 'undefined') return;
  try {
    const list = getWishlist().filter((item) => item._id !== id);
    localStorage.setItem('wishlist', JSON.stringify(list));
  } catch {}
}

export function isInWishlist(id) {
  if (typeof window === 'undefined') return false;
  try {
    return getWishlist().some((item) => item._id === id);
  } catch {
    return false;
  }
}
