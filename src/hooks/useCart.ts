// src/hooks/useCart.ts
export { useCart } from '@/context/cartContext';

export type { CartItem } from '@/context/cartContext';

// Si ton contexte ne les exporte pas déjà, voici des types de base à viser :
// export interface CartItem { id: string; title: string; price: number; quantity: number; image?: string; slug?: string; }
// export interface UseCartReturn {
//   items: CartItem[];
//   addToCart(item: CartItem): void;
//   removeFromCart(id: string): void;
//   updateQuantity(id: string, qty: number): void;
//   clearCart(): void;
//   total: number;
// }
