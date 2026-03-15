// src/app/layout.tsx

import './globals.css'

import { SpeedInsights } from '@vercel/speed-insights/next'
import { Inter, Sora } from 'next/font/google'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { Suspense } from 'react'
import { Toaster } from 'react-hot-toast'

import type { Metadata, Viewport } from 'next'
import type React from 'react'

import AfterIdleClient from '@/components/AfterIdleClient'
import AppInstallPrompt from '@/components/AppInstallPrompt'
import ConsentBanner from '@/components/ConsentBanner'
import OfflineBanner from '@/components/OfflineBanner'
import DarkModeScript from '@/components/DarkModeScript'
import Layout from '@/components/layout/Layout'
import RootLayoutClient from '@/components/RootLayoutClient'
import SkipLink from '@/components/SkipLink'
import StickyCartSummary from '@/components/StickyCartSummary'
import Tracking from '@/components/Tracking'
import StickyFreeShippingBar from '@/components/ui/StickyFreeShippingBar'
import ThemeProvider from '@/context/themeContext'
import loadMessages from '@/i18n/loadMessages'
import { BRAND } from '@/lib/constants'
import { DEFAULT_LOCALE, toLangTag, toOgLocale } from '@/lib/language'

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

const SITE_URL = BRAND.URL
const SITE_NAME = BRAND.NAME
const DEFAULT_OG = '/og-image.jpg'
const IS_PREVIEW =
  process.env.VERCEL_ENV === 'preview' || process.env.NEXT_PUBLIC_NOINDEX === '1'
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim()
const GTM_SERVER = (process.env.NEXT_PUBLIC_GTM_SERVER || '').replace(/\/+$/, '')

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: {
      default: 'TechPlay – Boutique high-tech innovante',
      template: '%s | TechPlay',
    },
    description:
      'TechPlay, votre boutique high-tech : audio, gaming, accessoires et packs exclusifs. Qualité, rapidité et expérience premium.',
    keywords: [
      'high-tech',
      'gaming',
      'audio',
      'accessoires',
      'e-commerce',
      'TechPlay',
      'packs exclusifs',
    ],
    alternates: {
      canonical: '/fr',
      languages: {
        fr: '/fr',
        en: '/en',
        'x-default': '/fr',
      },
    },
    openGraph: {
      title: 'TechPlay – Boutique high-tech innovante',
      description:
        'TechPlay, votre boutique high-tech : audio, gaming, accessoires et packs exclusifs.',
      url: SITE_URL,
      siteName: SITE_NAME,
      images: [
        {
          url: DEFAULT_OG,
          width: 1200,
          height: 630,
          alt: 'TechPlay – Boutique high-tech',
        },
      ],
      locale: toOgLocale(DEFAULT_LOCALE),
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
      apple: [{ url: '/icons/icon-192x192.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/site.webmanifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: SITE_NAME,
    },
    formatDetection: {
      telephone: false,
      address: false,
      email: false,
    },
    robots: {
      index: !IS_PREVIEW,
      follow: !IS_PREVIEW,
      googleBot: {
        index: !IS_PREVIEW,
        follow: !IS_PREVIEW,
      },
    },
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const defaultMessages = await loadMessages(DEFAULT_LOCALE)
  return (
    <html
      lang={toLangTag(DEFAULT_LOCALE)}
      dir="ltr"
      className={`${inter.variable} ${sora.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <meta httpEquiv="content-language" content={DEFAULT_LOCALE} />
        <meta name="application-name" content={SITE_NAME} />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />

        <DarkModeScript />

        <script
          id="locale-html-attrs"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var path = window.location.pathname || '/';
                  var locale = /^\\/en(?:\\/|$)/.test(path) ? 'en' : 'fr';
                  var html = document.documentElement;
                  html.lang = locale === 'en' ? 'en-US' : 'fr-FR';
                  html.setAttribute('data-locale', locale);
                } catch (e) {}
              })();
            `,
          }}
        />

        <script
          id="consent-default"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                window.dataLayer = window.dataLayer || [];
                window.gtag = window.gtag || function(){ (window.dataLayer || []).push(arguments); };

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
                  try {
                    var allowed = [
                      'ad_storage',
                      'analytics_storage',
                      'ad_user_data',
                      'ad_personalization',
                      'functionality_storage',
                      'security_storage'
                    ];

                    var clean = {};
                    for (var k in next) {
                      if (allowed.indexOf(k) > -1) clean[k] = next[k];
                    }

                    window.__consentState = Object.assign({}, window.__consentState, clean);
                    gtag('consent', 'update', clean);
                    (window.dataLayer || []).push({
                      event: 'consent_update',
                      consent: window.__consentState
                    });
                  } catch (e) {}
                };
              })();
            `,
          }}
        />

        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />

        {GTM_SERVER ? (
          <>
            <link rel="preconnect" href={GTM_SERVER} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={GTM_SERVER} />
          </>
        ) : null}
      </head>

      <body className="min-h-screen bg-[hsl(var(--bg))] text-token-text antialiased dark:[color-scheme:dark]">
        <NextIntlClientProvider locale={DEFAULT_LOCALE} messages={defaultMessages}>
        <SkipLink />
        {GTM_ID ? (
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />
        ) : null}

        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute left-1/2 top-[-120px] h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-accent/25 blur-3xl dark:bg-accent/30" />
          <div className="absolute bottom-[-140px] right-[-120px] h-[360px] w-[360px] rounded-full bg-brand/10 blur-3xl dark:bg-brand/20" />
          <div
            className="absolute inset-0 opacity-[0.08] dark:opacity-[0.11]"
            style={{
              backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
              backgroundSize: '22px 22px',
              color: 'rgba(0,0,0,.65)',
              maskImage:
                'linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%)',
            }}
          />
        </div>

        <div id="focus-sentinel" tabIndex={-1} />

        <ThemeProvider>
          <RootLayoutClient>
            <AfterIdleClient>
              <Suspense fallback={null}>
                <Tracking />
              </Suspense>

              <AppInstallPrompt />
              <StickyFreeShippingBar />
              <StickyCartSummary />
              <ConsentBanner />
              <OfflineBanner />

              <Toaster
                position="top-right"
                gutter={12}
                containerClassName="toast-container"
                toastOptions={{
                  duration: 3500,
                  className: 'toast-item',
                  style: {
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px 18px',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--surface))',
                    color: 'hsl(var(--text))',
                  },
                }}
              />
            </AfterIdleClient>

            <Layout>{children}</Layout>
            <SpeedInsights />
          </RootLayoutClient>
        </ThemeProvider>
        </NextIntlClientProvider>

        {GTM_ID ? (
          <Script
            id="gtm-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){
                  w[l]=w[l]||[];
                  w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                  var f=d.getElementsByTagName(s)[0],
                      j=d.createElement(s),
                      dl=l!='dataLayer' ? '&l='+l : '';
                  j.async=true;
                  j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                  ${GTM_SERVER ? `j.setAttribute('data-gtm-server', '${GTM_SERVER}');` : ''}
                  f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${GTM_ID}');
              `,
            }}
          />
        ) : null}

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