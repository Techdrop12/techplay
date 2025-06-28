// ✅ /src/lib/wishlist.js (helper wishlist, sécurisé et SSR-ready)

const STORAGE_KEY = 'wishlist';
const MAX_ITEMS = 20;

/**
 * Récupère la liste des produits en wishlist depuis localStorage
 */
export function getWishlist() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    console.warn('Erreur lecture wishlist:', e);
    return [];
  }
}

/**
 * Vérifie si un produit est dans la wishlist
 */
export function isInWishlist(productId) {
  if (typeof window === 'undefined') return false;
  try {
    const current = getWishlist();
    return current.some((p) => p._id === productId);
  } catch (e) {
    console.warn('Erreur isInWishlist:', e);
    return false;
  }
}

/**
 * Ajoute ou retire un produit de la wishlist (toggle)
 */
export function toggleWishlistItem(product) {
  if (typeof window === 'undefined') return;

  try {
    let list = getWishlist();
    const exists = list.find((p) => p._id === product._id);

    if (exists) {
      list = list.filter((p) => p._id !== product._id);
    } else {
      list.unshift(product);
      list = list.slice(0, MAX_ITEMS); // Limiter à 20 produits
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage')); // synchro inter-onglets
  } catch (e) {
    console.warn('Erreur sauvegarde wishlist:', e);
  }
}
