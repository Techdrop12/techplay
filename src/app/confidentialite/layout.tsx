import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité et protection des données personnelles sur TechPlay.',
  robots: { index: true, follow: true },
}

export default function ConfidentialiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
