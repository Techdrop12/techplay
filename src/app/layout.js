import '../styles/globals.css'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import OrganizationJsonLd from '@/components/JsonLd/OrganizationJsonLd'

const ClientWrapper = dynamic(() => import('@/components/ClientWrapper'), { ssr: false })
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.vercel.app'),
  title: 'TechPlay',
  description: 'La boutique ultime pour les passionnés de tech.',
  icons: { icon: '/favicon.ico' },
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

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="robots" content="index, follow" />
        <link rel="manifest" href="/manifest.json" />
        <OrganizationJsonLd />
      </head>
      <body className={inter.className}>
        <ClientWrapper>{children}</ClientWrapper>
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
