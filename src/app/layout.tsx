// src/app/layout.tsx
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'

import { ThemeProvider } from '@/context/themeContext'
import Layout from '@/components/layout/Layout'

// Clients/UX
import StickyFreeShippingBar from '@/components/ui/StickyFreeShippingBar'
import StickyCartSummary from '@/components/StickyCartSummary'
import { Toaster } from 'react-hot-toast'

// Analytics (client components)
import Analytics from '@/components/Analytics'
import MetaPixel from '@/components/MetaPixel'
import Hotjar from '@/components/Hotjar'
import AppInstallPrompt from '@/components/AppInstallPrompt'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techplay.example.com'
const SITE_NAME = 'TechPlay'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'TechPlay – Boutique high-tech innovante', template: '%s | TechPlay' },
  description:
    'TechPlay, votre boutique high-tech : audio, gaming, accessoires et packs exclusifs. Qualité, rapidité, satisfaction garantie.',
  keywords: [
    'TechPlay',
    'boutique high-tech',
    'gadgets',
    'gaming',
    'audio',
    'accessoires',
    'packs',
    'technologie',
  ],
  applicationName: SITE_NAME,
  category: 'technology',
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
    creator: '@TechPlay',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: { canonical: SITE_URL },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: 'default' },
  formatDetection: { telephone: false, address: false, email: false },
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
          {/* Wrap ALL client stuff with Suspense to satisfy useSearchParams() constraint */}
          <Suspense fallback={null}>
            {/* Analytics & Pixels (no-ops si désactivés) */}
            <Analytics />
            <MetaPixel />
            <Hotjar />

            {/* PWA prompt */}
            <AppInstallPrompt />

            {/* Global UI */}
            <Layout>{children}</Layout>

            {/* Sticky helpers */}
            <StickyFreeShippingBar />
            <StickyCartSummary />

            {/* Toasts */}
            <Toaster position="top-right" />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
