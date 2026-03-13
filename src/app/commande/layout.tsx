import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Commande',
  description: 'Finalisez votre commande en toute sécurité. Paiement Stripe, livraison 48–72 h.',
  robots: { index: false, follow: false },
}

export default function CommandeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
