// ✅ src/app/[locale]/layout.js
import '../../styles/globals.css';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { headers } from 'next/headers';
import RootLayoutClient from '@/components/RootLayoutClient';
import LayoutWithAnalytics from './LayoutWithAnalytics';
import { CartProvider } from '@/context/cartContext';
import { CartAnimationProvider } from '@/context/cartAnimationContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', preload: true });

const themeInitScript = `
  try {
    const mode = localStorage.getItem('theme');
    if (mode === 'dark' || (!mode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch(e) {}
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

export default async function LocaleLayout({ children, params }) {
  const headerList = await headers();
  const userAgent = headerList.get('user-agent') || '';
  const isBot = /bot|crawl|slurp|spider/i.test(userAgent);

  return (
    <html lang={params.locale} className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <Script id="init-theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInitScript }} />

        {/* Preload police Inter */}
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
      </head>
      <body className="bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
        <CartProvider>
          <CartAnimationProvider>
            <RootLayoutClient>
              <LayoutWithAnalytics>{children}</LayoutWithAnalytics>
            </RootLayoutClient>
          </CartAnimationProvider>
        </CartProvider>
      </body>
    </html>
  );
}
