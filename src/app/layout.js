import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider, useMessages } from 'next-intl'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import OrganizationJsonLd from '@/components/JsonLd/OrganizationJsonLd'

// ❗ import dynamique pour éviter les hooks client côté serveur
const ClientWrapper = dynamic(() => import('@/components/ClientWrapper'), { ssr: false })

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TechPlay',
  description: 'La boutique ultime pour les passionnés de tech.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'TechPlay',
    description: 'La boutique ultime pour les passionnés de tech.',
    url: 'https://techplay.com',
    siteName: 'TechPlay',
    images: [
      {
        url: '/opengraph-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TechPlay',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function RootLayout({ children, params: { locale } }) {
  const messages = useMessages()

  return (
    <html lang={locale}>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="robots" content="index, follow" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href={`https://techplay.com/${locale}`} />
        <OrganizationJsonLd />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientWrapper>{children}</ClientWrapper>
        </NextIntlClientProvider>

        {/* Meta Pixel fallback */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
      </body>
    </html>
  )
}
