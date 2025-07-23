import './globals.css'
import { ThemeProvider } from '@/context/themeContext'
import Layout from '@/components/layout/Layout'

export const metadata = {
  title: 'TechPlay – Boutique high-tech innovante',
  description: 'Découvrez TechPlay, la meilleure boutique tech en dropshipping avec IA, PWA, sécurité et design premium',
  keywords: 'TechPlay, e-commerce, high-tech, gadgets, dropshipping, PWA, IA',
  openGraph: {
    title: 'TechPlay – Boutique high-tech innovante',
    description: 'Découvrez TechPlay, la meilleure boutique tech en dropshipping avec IA, PWA, sécurité et design premium',
    url: 'https://techplay.example.com',
    siteName: 'TechPlay',
    images: [
      {
        url: 'https://techplay.example.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TechPlay – Boutique high-tech'
      }
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechPlay – Boutique high-tech innovante',
    description: 'Découvrez TechPlay, la meilleure boutique tech en dropshipping',
    creator: '@TechPlay',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  )
}
