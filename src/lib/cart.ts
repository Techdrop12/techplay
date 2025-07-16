export function getCart() {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem('cart')
  return raw ? JSON.parse(raw) : []
}

export function saveCart(cart: any[]) {
  localStorage.setItem('cart', JSON.stringify(cart))
}
