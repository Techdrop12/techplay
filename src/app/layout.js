// ✅ /src/app/layout.js (full option, analytique, SEO, PWA, accessibilité, dark mode, bonus inclus)
import './globals.css';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'TechPlay – High Tech, Gadgets et Accessoires',
    template: '%s | TechPlay'
  },
  description: 'TechPlay : boutique en ligne d’objets high-tech, accessoires et innovations. Livraison rapide, avis clients, offres spéciales, garantie et SAV premium.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  },
  themeColor: '#2563eb',
  openGraph: {
    type: 'website',
    title: 'TechPlay – High Tech, Gadgets et Accessoires',
    description: 'TechPlay : boutique en ligne d’objets high-tech, accessoires et innovations.',
    url: 'https://techplay.fr',
    images: [
      { url: '/og-image.jpg', width: 1200, height: 630, alt: 'TechPlay OG' }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@techplay',
    title: 'TechPlay – High Tech, Gadgets et Accessoires',
    description: 'TechPlay : boutique en ligne d’objets high-tech, accessoires et innovations.',
    images: ['/og-image.jpg']
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="scroll-smooth dark">
      <Head>
        {/* SEO essentials */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.ico" />
        {/* Preload font */}
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* Preconnect bonus */}
        <link rel="preconnect" href="https://plausible.io" crossOrigin="" />
        <link rel="preconnect" href="https://www.clarity.ms" crossOrigin="" />
        {/* PWA prompt */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>

      {/* Plausible Analytics */}
      <Script
        defer
        data-domain="techplay.fr"
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
      {/* Microsoft Clarity */}
      <Script
        id="clarity"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "YOUR_CLARITY_ID");
          `
        }}
      />

      {/* Dark mode switch (auto / user) */}
      <body className={`${inter.className} bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
