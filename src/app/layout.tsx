// src/app/layout.tsx — Root layout (lang from cookie or Accept-Language), default-locale without prefix
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Sora } from 'next/font/google'
import { Suspense } from 'react'
import Script from 'next/script'
import type React from 'react'
import { cookies, headers } from 'next/headers'

import Layout from '@/components/layout/Layout'
import RootLayoutClient from '@/components/RootLayoutClient'
import AfterIdleClient from '@/components/AfterIdleClient'
import ThemeProvider from '@/context/themeContext'
import DarkModeScript from '@/components/DarkModeScript'
import AccessibilitySkip from '@/components/AccessibilitySkip'
import StickyFreeShippingBar from '@/components/ui/StickyFreeShippingBar'
import StickyCartSummary from '@/components/StickyCartSummary'
import { Toaster } from 'react-hot-toast'
import Tracking from '@/components/Tracking'
import AppInstallPrompt from '@/components/AppInstallPrompt'
import ConsentBanner from '@/components/ConsentBanner'

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, toOgLocale, toLangTag, pickBestLocale, type Locale } from '@/lib/language'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter', adjustFontFallback: true })
const sora = Sora({ subsets: ['latin'], display: 'swap', variable: '--font-sora' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techplay.example.com'
const SITE_NAME = 'TechPlay'
const DEFAULT_OG = '/og-image.jpg'
const IS_PREVIEW = process.env.VERCEL_ENV === 'preview' || process.env.NEXT_PUBLIC_NOINDEX === '1'
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID
const GTM_SERVER = (process.env.NEXT_PUBLIC_GTM_SERVER || '').replace(/\/+$/, '')

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value
  const acceptLang = (await headers()).get('accept-language')
  const locale: Locale = isLocale(cookieLocale) ? (cookieLocale as Locale) : pickBestLocale(acceptLang)

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: { default: 'TechPlay – Boutique high-tech innovante', template: '%s | TechPlay' },
    description:
      'TechPlay, votre boutique high-tech : audio, gaming, accessoires et packs exclusifs. Qualité, rapidité, satisfaction garantie.',
    keywords: ['high-tech', 'gaming', 'audio', 'accessoires', 'e-commerce', 'TechPlay', 'packs exclusifs'],
    openGraph: {
      title: 'TechPlay – Boutique high-tech innovante',
      description: 'TechPlay, votre boutique high-tech : audio, gaming, accessoires.',
      url: SITE_URL,
      siteName: SITE_NAME,
      images: [{ url: DEFAULT_OG, width: 1200, height: 630, alt: 'TechPlay – Boutique high-tech' }],
      locale: toOgLocale(locale),
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: 'TechPlay – Boutique high-tech innovante', description: 'TechPlay…', images: [DEFAULT_OG] },
    icons: {
      icon: [{ url: '/favicon.ico' }, { url: '/icons/icon-192x192.png', type: 'image/png', sizes: '192x192' }, { url: '/icons/icon-512x512.png', type: 'image/png', sizes: '512x512' }],
      apple: [{ url: '/icons/icon-192x192.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/site.webmanifest',
    appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: SITE_NAME },
    formatDetection: { telephone: false, address: false, email: false },
    robots: { index: !IS_PREVIEW, follow: !IS_PREVIEW, googleBot: { index: !IS_PREVIEW, follow: !IS_PREVIEW } },
    referrer: 'strict-origin-when-cross-origin',
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value
  const acceptLang = (await headers()).get('accept-language')
  const currentLocale: Locale =
    isLocale(cookieLocale || '') ? (cookieLocale as Locale) : pickBestLocale(acceptLang)

  return (
    <html lang={toLangTag(currentLocale)} dir="ltr" className={`${inter.variable} ${sora.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <meta httpEquiv="content-language" content={currentLocale} />
        <DarkModeScript />

        {/* Consent Mode v2 par défaut (denied) + helpers globaux */}
        <script
          id="consent-default"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                window.dataLayer = window.dataLayer || [];
                window.gtag = function(){ dataLayer.push(arguments); };
                var DEFAULT = {
                  ad_storage: 'denied',
                  analytics_storage: 'denied',
                  ad_user_data: 'denied',
                  ad_personalization: 'denied',
                  functionality_storage: 'granted',
                  security_storage: 'granted',
                  wait_for_update: 500
                };
                gtag('consent', 'default', DEFAULT);
                window.__consentState = { ...DEFAULT };
                window.__applyConsent = function(next){
                  try{
                    var allowed = ['ad_storage','analytics_storage','ad_user_data','ad_personalization','functionality_storage','security_storage'];
                    var clean = {};
                    for (var k in next) if (allowed.indexOf(k) > -1) clean[k] = next[k];
                    window.__consentState = Object.assign({}, window.__consentState, clean);
                    gtag('consent', 'update', clean);
                    (window.dataLayer||[]).push({ event: 'consent_update', consent: window.__consentState });
                  }catch(e){}
                };
              })();
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
        {GTM_SERVER && <link rel="preconnect" href={GTM_SERVER} crossOrigin="" />}
        {GTM_SERVER && <link rel="dns-prefetch" href={GTM_SERVER} />}
        <link rel="preload" as="image" href="/carousel/hero-1-mobile.jpg" media="(max-width: 639px)" />
        <link rel="preload" as="image" href="/carousel/hero-1-desktop.jpg" media="(min-width: 640px)" />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      </head>

      <body className="min-h-screen bg-token-surface text-token-text antialiased dark:[color-scheme:dark]">
        {GTM_ID ? (
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />
        ) : null}

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
              WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%)',
            } as React.CSSProperties}
          />
        </div>

        <AccessibilitySkip />
        <div id="focus-sentinel" tabIndex={-1} />

        <ThemeProvider>
          <RootLayoutClient>
            <AfterIdleClient>
              <Suspense fallback={null}><Tracking /></Suspense>
              <AppInstallPrompt />
              <StickyFreeShippingBar />
              <StickyCartSummary />
              <ConsentBanner />
              <Toaster position="top-right" />
            </AfterIdleClient>
            <Layout>{children}</Layout>
          </RootLayoutClient>
        </ThemeProvider>

        {GTM_ID ? (
          <Script
            id="gtm-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){
                  w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                  var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
                  j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                  ${GTM_SERVER ? `j.setAttribute('data-gtm-server', '${GTM_SERVER}');` : ''}
                  f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${GTM_ID}');
              `,
            }}
          />
        ) : null}

        {/* JSON-LD global (Organization + WebSite) */}
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
              sameAs: [],
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
                target: `${SITE_URL}/products?q={search_term_string}`,
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
