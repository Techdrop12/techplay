// src/app/layout.tsx
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Suspense, type ReactNode } from 'react'

// Shell UI & providers
import Layout from '@/components/layout/Layout'
import RootLayoutClient from '@/components/RootLayoutClient'

// UX helpers (client)
import StickyFreeShippingBar from '@/components/ui/StickyFreeShippingBar'
import StickyCartSummary from '@/components/StickyCartSummary'
import { Toaster } from 'react-hot-toast'

// Analytics / Pixels (client)
import Analytics from '@/components/Analytics'
import MetaPixel from '@/components/MetaPixel'
import Hotjar from '@/components/Hotjar'

// PWA prompt
import AppInstallPrompt from '@/components/AppInstallPrompt'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techplay.example.com'
const SITE_NAME = 'TechPlay'

/* =========================
   SEO / PWA global metadata
   ========================= */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TechPlay – Boutique high-tech innovante',
    template: '%s | TechPlay',
  },
  description:
    'TechPlay, votre boutique high-tech : audio, gaming, accessoires et packs exclusifs. Qualité, rapidité, satisfaction garantie.',
  manifest: '/site.webmanifest',
  applicationName: SITE_NAME,
  robots: { index: true, follow: true },
  alternates: {
    canonical: '/',
    languages: {
      fr: '/fr',
      en: '/en',
    },
  },
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
  icons: {
    icon: [{ url: '/favicon.ico' }],
    shortcut: [{ url: '/favicon.ico' }],
    apple: [{ url: '/icons/icon-192x192.png' }],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} scroll-smooth no-js`} suppressHydrationWarning>
      <head>
        {/* Preconnects (perf) */}
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://static.hotjar.com" crossOrigin="" />
        <link rel="preconnect" href="https://script.hotjar.com" crossOrigin="" />

        {/* LCP image preload (adapter si besoin) */}
        <link rel="preload" as="image" href="/carousel1.jpg" />

        {/* Anti-FOUC & dark mode earliest */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){try{var d=document.documentElement;d.classList.remove('no-js');d.classList.add('js');
var t=localStorage.getItem('theme');
if(t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){d.classList.add('dark');}
}catch(e){}}();`,
          }}
        />
      </head>

      <body className="min-h-screen bg-white text-black antialiased dark:bg-black dark:text-white">
        {/* Skip link a11y */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-black/90 focus:px-4 focus:py-2 focus:text-white dark:focus:bg-white/90 dark:focus:text-black"
        >
          Aller au contenu
        </a>

        <RootLayoutClient>
          {/* Analytics / Pixels sous Suspense (SSR-safe) */}
          <Suspense fallback={null}>
            <Analytics />
          </Suspense>
          <Suspense fallback={null}>
            <MetaPixel />
          </Suspense>
          <Suspense fallback={null}>
            <Hotjar />
          </Suspense>

          {/* PWA install prompt (client) */}
          <AppInstallPrompt />

          {/* Shell UI */}
          {/* ⚠️ Ne pas mettre id="main" ici pour éviter le doublon avec les pages */}
          <Layout>{children}</Layout>

          {/* Helpers UX */}
          <StickyFreeShippingBar />
          <StickyCartSummary />

          {/* Toaster global */}
          <Toaster position="top-right" />
        </RootLayoutClient>

        {/* JSON-LD Organization + WebSite (SearchAction) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: SITE_NAME,
                url: SITE_URL,
                sameAs: [
                  'https://facebook.com/techplay',
                  'https://twitter.com/techplay',
                  'https://instagram.com/techplay',
                ],
              },
              null,
              0
            ),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                url: SITE_URL,
                name: SITE_NAME,
                potentialAction: {
                  '@type': 'SearchAction',
                  target: `${SITE_URL}/products?search={search_term_string}`,
                  'query-input': 'required name=search_term_string',
                },
              },
              null,
              0
            ),
          }}
        />
      </body>
    </html>
  )
}
