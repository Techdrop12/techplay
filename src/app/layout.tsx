import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'

import Layout from '@/components/layout/Layout'
import RootLayoutClient from '@/components/RootLayoutClient'

// Clients/UX
import StickyFreeShippingBar from '@/components/ui/StickyFreeShippingBar'
import StickyCartSummary from '@/components/StickyCartSummary'
import { Toaster } from 'react-hot-toast'

// Analytics (client)
import Analytics from '@/components/Analytics'
import MetaPixel from '@/components/MetaPixel'
import Hotjar from '@/components/Hotjar'
import AppInstallPrompt from '@/components/AppInstallPrompt'

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
        {/* PWA / perf */}
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>

      <body className="min-h-screen bg-white text-black antialiased dark:bg-black dark:text-white">
        {/* ✅ Tous les providers client (Theme + Cart) sont gérés dans RootLayoutClient */}
        <RootLayoutClient>
          {/* Analytics & pixels sous Suspense pour éviter tout bailout pendant le prerender */}
          <Suspense fallback={null}><Analytics /></Suspense>
          <Suspense fallback={null}><MetaPixel /></Suspense>
          <Suspense fallback={null}><Hotjar /></Suspense>

          {/* PWA install prompt (client) */}
          <AppInstallPrompt />

          {/* UI globale */}
          <Layout>{children}</Layout>

          {/* Helpers sticky */}
          <StickyFreeShippingBar />
          <StickyCartSummary />

          {/* Toaster global */}
          <Toaster position="top-right" />
        </RootLayoutClient>
      </body>
    </html>
  )
}
