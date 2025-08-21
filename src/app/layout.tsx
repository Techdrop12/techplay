// src/app/layout.tsx
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Sora } from 'next/font/google'
import { Suspense } from 'react'
import type React from 'react'

import Layout from '@/components/layout/Layout'
import RootLayoutClient from '@/components/RootLayoutClient'
import AfterIdleClient from '@/components/AfterIdleClient'

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

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: true,
})

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sora',
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
  verification: {},
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
      className={`${inter.variable} ${sora.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-FOUC thème: appliquer le mode sombre le plus tôt possible */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                if (t === 'dark') document.documentElement.classList.add('dark');
              } catch(e) {}
            `,
          }}
        />

        {/* Consent Mode v2 par défaut */}
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

        {/* Perf: préconnect (avec CORS lorsque utile) */}
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="" />
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://static.hotjar.com" />
        <link rel="dns-prefetch" href="https://static.hotjar.com" />

        {/* LCP: précharge la 1ère image du hero */}
        <link rel="preload" as="image" href="/carousel1.jpg" />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      </head>

      {/* Utilisation des tokens tailwind (bg-token-\* / text-token-\*) */}
      <body className="min-h-screen bg-token-surface text-token-text antialiased dark:[color-scheme:dark]">
        {/* Décor global premium */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute left-1/2 top-[-120px] h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-accent/25 blur-3xl dark:bg-accent/30" />
          <div className="absolute right-[-120px] bottom-[-140px] h-[360px] w-[360px] rounded-full bg-brand/10 blur-3xl dark:bg-brand/20" />
          <div
            className="absolute inset-0 opacity-[0.08] dark:opacity-[0.11]"
            style={{
              backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
              backgroundSize: '22px 22px',
              color: 'rgba(0,0,0,.65)',
              maskImage: 'linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%)',
            } as React.CSSProperties}
          />
        </div>

        <AccessibilitySkip />
        {/* Sentinelle pour focus (évite un doublon d'ID avec <main id="main">) */}
        <div id="focus-sentinel" tabIndex={-1} />

        <RootLayoutClient>
          <AfterIdleClient>
            <Suspense fallback={null}><Analytics /></Suspense>
            <Suspense fallback={null}><MetaPixel /></Suspense>
            <Suspense fallback={null}><Hotjar /></Suspense>

            <AppInstallPrompt />
            <StickyFreeShippingBar />
            <StickyCartSummary />
            <Toaster position="top-right" />
          </AfterIdleClient>

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
        {/* JSON-LD WebSite + SearchAction */}
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
        <div className="pb-[env(safe-area-inset-bottom)]" aria-hidden />
      </body>
    </html>
  )
}
