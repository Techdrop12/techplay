// ✅ src/app/[locale]/LayoutWithAnalytics.js
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartReminder from '@/components/CartReminder';
import LiveChat from '@/components/LiveChat';
import ScrollToTop from '@/components/ScrollToTop';
import { ToastContainer } from 'react-toastify';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { useCart } from '@/context/cartContext';
import { CartAnimationProvider } from '@/context/cartAnimationContext';
import 'react-toastify/dist/ReactToastify.css';

export default function LayoutWithAnalytics({ children, locale }) {
  const pathname = usePathname();
  const { cart } = useCart();

  useEffect(() => {
    // Préchargement des préférences utilisateur (ex: dark mode)
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme');
      if (
        theme === 'dark' ||
        (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  return (
    <>
      <Analytics />
      <SpeedInsights />
      <LiveChat />
      <Header locale={locale} />
      <CartAnimationProvider>
        <main>{children}</main>
      </CartAnimationProvider>
      <Footer locale={locale} />
      <CartReminder cart={cart} />
      <ScrollToTop />
      <ToastContainer position="bottom-center" />
    </>
  );
}
