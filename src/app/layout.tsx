// src/app/layout.tsx
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

import Layout from '@/components/layout/Layout'
import RootLayoutClient from '@/components/RootLayoutClient'

// UX / UI (client)
import AccessibilitySkip from '@/components/AccessibilitySkip'
import StickyFreeShippingBar from '@/components/ui/StickyFreeShippingBar'
import StickyCartSummary from '@/components/StickyCartSummary'
import { Toaster } from 'react-hot-toast'

// Analytics (client)
import Analytics from '@/components/Analytics'
import MetaPixel from '@/components/MetaPixel'
import Hotjar from '@/components/Hotjar'

// PWA prompt
import AppInstallPrompt from '@/components/AppInstallPrompt'

/** Monte un sous-arbre client après l'idle du thread (réduit le JS au démarrage) */
function AfterIdle({ children }: { children: ReactNode }) {
  'use client'
  const [ready, setReady] = require('react').useState(false)
  require('react').useEffect(() => {
    const ric: any =
      (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 1))
    const id = ric(() => setReady(true))
    return () => {
      ;(window as any).cancelIdleCallback?.(id)
      clearTimeout(id)
    }
  }, [])
  if (!ready) return null
  return <>{children}</>
}

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: true,
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techplay.example.com'
const SITE_NAME = 'TechPlay'
const DEFAULT_OG = '/og-image.jpg'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: { default: 'TechPlay – Boutique high-tech innovante', template: '%s | TechPlay' },
  description:
    'TechPlay, votre boutique high-tech : audio, gaming, accessoires et packs exclusifs. Qualité, rapidité, satisfaction garantie.',
  keywords: ['high-tech', 'gaming', 'audio', 'accessoires', 'e-commerce', 'TechPlay', 'packs exclusifs'],
  alternates: {
    canonical: SITE_URL,
    languages: { 'fr-FR': `${SITE_URL}/`, 'en-US': `${SITE_URL}/en` },
  },
  openGraph: {
    title: 'TechPlay – Boutique high-tech innovante',
    description:
      'TechPlay, votre boutique high-tech : audio, gaming, accessoires et packs exclusifs.',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: DEFAULT_OG, width: 1200, height: 630, alt: 'TechPlay – Boutique high-tech' }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechPlay – Boutique high-tech innovante',
    description:
      'TechPlay, votre boutique high-tech : audio, gaming, accessoires et packs exclusifs.',
    images: [DEFAULT_OG],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: '/icons/maskable-icon.png', color: '#000000' }],
  },
  manifest: '/site.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: SITE_NAME },
  formatDetection: { telephone: false, address: false, email: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  referrer: 'strict-origin-when-cross-origin',
  verification: {
    // google: 'xxxx',
    // yandex: 'xxxx',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      dir="ltr"
      className={`${inter.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* Consent Mode v2 par défaut (privacy-first) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              window.gtag = function(){ dataLayer.push(arguments); };
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'analytics_storage': 'denied',
                'functionality_storage': 'granted',
                'security_storage': 'granted',
                'wait_for_update': 500
              });
            `,
          }}
        />

        {/* Perf: préconnexion (ne bloque pas le rendu) */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://static.hotjar.com" />
        <link rel="dns-prefetch" href="https://static.hotjar.com" />
        {/* <link rel="preconnect" href="https://js.stripe.com" /> */}
        {/* <link rel="preconnect" href="https://m.stripe.network" /> */}

        {/* LCP: précharger la 1ère image du hero/carousel */}
        <link rel="preload" as="image" href="/carousel1.jpg" />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        {/* <link rel="search" type="application/opensearchdescription+xml" href="/opensearch.xml" title="TechPlay" /> */}
      </head>

      <body className="min-h-screen bg-white text-black antialiased dark:bg-black dark:text-white">
        {/* Décor global premium (glows + dotted grid) */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          {/* glows radiaux */}
          <div className="absolute left-1/2 top-[-120px] h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-accent/25 blur-3xl dark:bg-accent/30" />
          <div className="absolute right-[-120px] bottom-[-140px] h-[360px] w-[360px] rounded-full bg-brand/10 blur-3xl dark:bg-brand/20" />
          {/* grille à pois masquée */}
          <div
            className="absolute inset-0 opacity-[0.08] dark:opacity-[0.11]"
            style={{
              backgroundImage:
                'radial-gradient(currentColor 1px, transparent 1px)',
              backgroundSize: '22px 22px',
              color: 'rgba(0,0,0,.65)',
              maskImage:
                'linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%)',
            } as React.CSSProperties}
          />
        </div>

        <AccessibilitySkip />
        {/* ancre focusable (skip-link) */}
        <div id="main" tabIndex={-1} />

        <RootLayoutClient>
          {/* Déférer tout le JS non critique jusqu'à l'idle */}
          <AfterIdle>
            <Suspense fallback={null}><Analytics /></Suspense>
            <Suspense fallback={null}><MetaPixel /></Suspense>
            <Suspense fallback={null}><Hotjar /></Suspense>

            <AppInstallPrompt />
            <StickyFreeShippingBar />
            <StickyCartSummary />
            <Toaster position="top-right" />
          </AfterIdle>

          {/* Shell UI */}
          <Layout>{children}</Layout>
        </RootLayoutClient>

        {/* JSON-LD Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              sameAs: [
                'https://facebook.com/techplay',
                'https://twitter.com/techplay',
                'https://instagram.com/techplay',
              ],
            }),
          }}
        />
        {/* JSON-LD WebSite + SearchAction (route FR de recherche/listing) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: SITE_URL,
              name: SITE_NAME,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/produit?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {/* Safe-area iOS (espaces en bas si nécessaire) */}
        <div className="pb-[env(safe-area-inset-bottom)]" aria-hidden />
      </body>
    </html>
  )
}
