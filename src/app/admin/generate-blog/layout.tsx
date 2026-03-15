import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Générer un article (IA) – Admin TechPlay',
  description: 'Générer un article de blog avec l\'IA.',
  robots: { index: false, follow: false },
}

export default function GenerateBlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
