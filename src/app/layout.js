// src/app/layout.js
import '../styles/globals.css';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { headers } from 'next/headers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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

export default async function RootLayout({ children }) {
  const headerList = await headers(); // ✅ correction ici
  const userAgent = headerList.get('user-agent') || '';
  const isBot = /bot|crawl|slurp|spider/i.test(userAgent);

  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <Script id="init-theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
        {!isBot && <Analytics />}
        {!isBot && <SpeedInsights />}
        {children}
      </body>
    </html>
  );
}
