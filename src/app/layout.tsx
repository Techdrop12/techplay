import './globals.css'
import LayoutWithAnalytics from '@/components/layout/LayoutWithAnalytics'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'TechPlay – Boutique high-tech',
    template: '%s | TechPlay',
  },
  description: 'Découvrez les meilleurs gadgets tech, design, utiles et accessibles.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.className}>
      <body>
        <LayoutWithAnalytics>{children}</LayoutWithAnalytics>
      </body>
    </html>
  )
}
