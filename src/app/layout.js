// ✅ src/app/layout.js (TA VERSION - À GARDER TELLE QUELLE)
import '../styles/globals.css';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { headers } from 'next/headers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CartProvider } from '@/context/cartContext';
import { CartAnimationProvider } from '@/context/cartAnimationContext';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  preload: true
});

const themeInitScript = `
  try {
    const mode = localStorage.getItem('theme');
    if (mode === 'dark' || (!mode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch(e) {}`;

const stickyHeaderStyle = `
  header.sticky {
    position: sticky;
    top: 0;
    z-index: 1000;
    background-color: var(--body-bg, #fff);
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
    transition: background-color 0.3s ease;
  }
  :focus-visible {
    outline: 3px solid #2563eb;
    outline-offset: 2px;
  }
`;

export const metadata = {
  title: {
    default: 'TechPlay - Boutique Tech Premium',
    template: '%s | TechPlay',
  },
  description: 'La boutique ultime pour les passionnés de tech et de gadgets innovants.',
  metadataBase: new URL('https://techplay.fr'),
  openGraph: {
    title: 'TechPlay',
    description: 'Découvrez les meilleurs produits tech du moment, livrés gratuitement.',
    siteName: 'TechPlay',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechPlay',
    description: 'La boutique ultime pour les passionnés de tech.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({ children }) {
  const headerList = await headers();
  const userAgent = headerList.get('user-agent') || '';
  const isBot = /bot|crawl|slurp|spider/i.test(userAgent);

  const gaID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  const pixelID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          as="style"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        <style>{stickyHeaderStyle}</style>
        <meta name="theme-color" content="#000000" />
        <Script
          id="init-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />

        {!isBot && gaID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaID}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaID}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}

        {!isBot && pixelID && (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </head>
      <body className="bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
        {!isBot && <Analytics />}
        {!isBot && <SpeedInsights />}
        <CartProvider>
          <CartAnimationProvider>
            {children}
          </CartAnimationProvider>
        </CartProvider>
      </body>
    </html>
  );
}
