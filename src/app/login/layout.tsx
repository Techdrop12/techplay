import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion administrateur',
  description: 'Connexion à l’espace d’administration TechPlay.',
  robots: { index: false, follow: false },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
