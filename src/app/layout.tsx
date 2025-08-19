// src/app/layout.tsx
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import { ThemeProvider } from '@/context/themeContext'
import { CartProvider } from '@/context/cartContext'
import Layout from '@/components/layout/Layout'

// Clients/UX
import StickyFreeShippingBar from '@/components/ui/StickyFreeShippingBar'
import StickyCartSummary from '@/components/StickyCartSummary'
import { Toaster } from 'react-hot-toast'

// Analytics (no-ops si non configurés)
import Analytics from '@/components/Analytics'
import MetaPixel from '@/components/MetaPixel'
import Hotjar from '@/components/Hotjar'
import AppInstallPrompt from '@/components/AppInstallPrompt'
import RootLayoutClient from '@/components/RootLayoutClient'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techplay.example.com'
const SITE_NAME = 'TechPlay'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TechPlay – Boutique high-tech innovante',
    template: '%s | TechPlay',
  },
  description:
    'TechPlay, votre boutique high-tech : audio, gaming, accessoires et packs exclusifs. Qualité, rapidité, satisfaction garantie.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'TechPlay – Boutique high-tech innovante',
    description:
      'TechPlay, votre boutique high-tech : audio, gaming, accessoires et packs exclusifs.',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'TechPlay – Boutique high-tech' }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechPlay – Boutique high-tech innovante',
    description:
      'TechPlay, votre boutique high-tech : audio, gaming, accessoires et packs exclusifs.',
    images: ['/og-image.jpg'],
    creator: '@TechPlay',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        {/* PWA / Perf */}
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>

      <body className="min-h-screen bg-white text-black antialiased dark:bg-black dark:text-white">
        <ThemeProvider>
          {/* ✅ Corrige l’erreur : le CartProvider englobe toute l’app */}
          <CartProvider>
            <RootLayoutClient>
              <Analytics />
              <MetaPixel />
              <Hotjar />
              <AppInstallPrompt />

              <Layout>{children}</Layout>

              {/* UI sticky globale */}
              <StickyFreeShippingBar />
              <StickyCartSummary />

              {/* Toaster global */}
              <Toaster position="top-right" />
            </RootLayoutClient>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
