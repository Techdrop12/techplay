import type { Metadata } from 'next'
import CartPageClient from '@/components/cart/CartPageClient'

export const metadata: Metadata = {
  title: 'Mon panier – TechPlay',
  description: 'Consultez les produits de votre panier avant de passer commande.',
}

export default function CartPage() {
  return <CartPageClient />
}
