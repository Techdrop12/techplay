// src/app/layout.tsx — RootLayout ultra-premium (SEO/PWA/Consent/a11y/perf)
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Sora } from 'next/font/google'
import { Suspense } from 'react'
import type React from 'react'

// Langue depuis cookie NEXT_LOCALE
import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, isLocale } from '@/lib/language'

// Shell & clients
import Layout from '@/components/layout/Layout'
import RootLayoutClient from '@/components/RootLayoutClient'
import AfterIdleClient from '@/components/AfterIdleClient'

// Thème (canon)
import ThemeProvider from '@/context/themeContext'
import DarkModeScript from '@/components/DarkModeScript'

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

/* ----------------------------- Static metadata ---------------------------- */
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
    description: 'TechPlay, votre boutique high-tech : audio, gaming, accessoires et packs exclusifs.',
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
    // Tu n’as pas d’icône 180x180 dédiée : on pointe sur 192x192 (OK mais pas optimal).
    apple: [{ url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
    // Safari pinned tab → nécessite un SVG : on utilise ton logo.svg (monochrome conseillé)
    other: [{ rel: 'mask-icon', url: '/logo.svg', color: '#111111' }],
  },
  // ✅ Une SEULE webmanifest : /site.webmanifest (garde-la dans /public)
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

/* --------------------------------- Layout -------------------------------- */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  const htmlLang = isLocale(cookieLocale || '') ? (cookieLocale as string) : DEFAULT_LOCALE

  return (
    <html
      lang={htmlLang}
      dir="ltr"
      className={`${inter.variable} ${sora.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* DNS prefetch global */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />

        {/* Anti-FOUC + thème (respecte prefers-color-scheme et localStorage) */}
        <DarkModeScript />

        {/* Consent Mode v2 par défaut (opt-out) */}
        <script
          id="consent-default"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              window.gtag = function(){ dataLayer.push(arguments); };
              gtag('consent', 'default', {
                ad_storage: 'denied',
                analytics_storage: 'denied',
                functionality_storage: 'granted',
                security_storage: 'granted',
                wait_for_update: 500
              });
            `,
          }}
        />

        {/* Perf: preconnect/dns-prefetch */}
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="" />
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://static.hotjar.com" />
        <link rel="dns-prefetch" href="https://static.hotjar.com" />

        {/* LCP: précharge les visuels clés du hero (mobile + desktop) */}
        <link rel="preload" as="image" href="/carousel/hero-1-mobile.jpg" media="(max-width: 639px)" />
        <link rel="preload" as="image" href="/carousel/hero-1-desktop.jpg" media="(min-width: 640px)" />

        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      </head>

      <body className="min-h-screen bg-token-surface text-token-text antialiased dark:[color-scheme:dark]">
        {/* Décor global (non-interactif) */}
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
        <div id="focus-sentinel" tabIndex={-1} />

        {/* ✅ Thème source de vérité tout en haut */}
        <ThemeProvider>
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

            <Layout>{children}</Layout>
          </RootLayoutClient>
        </ThemeProvider>

        {/* JSON-LD Organization + WebSite (global, unique) */}
        <script
          id="ld-org"
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
        <script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: SITE_URL,
              name: SITE_NAME,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/products?q={search_term_string}`, // canon
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
