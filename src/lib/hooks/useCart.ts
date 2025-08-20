// /src/lib/hooks/useCart.ts
// Rétro-compat : ré-exporte le hook du nouveau context.
export type { CartItem, CartInput, CartContextValue } from '@/context/cartContext'
export { useCart } from '@/context/cartContext'
