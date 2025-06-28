'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LiveChat from '@/components/LiveChat';
import CartReminder from '@/components/CartReminder';
import ScrollToTop from '@/components/ScrollToTop';
import { ToastContainer } from 'react-toastify';
import { useAnalytics } from '@/lib/useAnalytics';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CartAnimationProvider } from '@/context/cartAnimationContext';
import 'react-toastify/dist/ReactToastify.css';

export default function LayoutWithAnalytics({ children, locale }) {
  useAnalytics(locale); // Appelle Meta Pixel, GA4, Clarity, etc.

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
      <CartReminder />
      <ScrollToTop />
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
    </>
  );
}
