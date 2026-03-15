import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Commande confirmée',
  description: 'Votre commande TechPlay a bien été enregistrée. Merci pour votre achat.',
  robots: { index: false, follow: true },
}

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
