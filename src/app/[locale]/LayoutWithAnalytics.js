// app/[locale]/LayoutWithAnalytics.js
'use client';

import ClientWrapper from '@/components/ClientWrapper';
import PromoBanner from '@/components/PromoBanner';
import EmailCapturePopup from '@/components/EmailCapturePopup';
import CartReminder from '@/components/CartReminder';
import LiveChat from '@/components/LiveChat';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import useAnalytics from '@/lib/useAnalytics';
import AnalyticsScripts from '@/components/AnalyticsScripts';

export default function LayoutWithAnalytics({ children }) {
  // Hook Analytics (client‐side)
  useAnalytics();

  return (
    <ClientWrapper>
      <PromoBanner />
      <Header />
      {children}
      <Footer />
      <CartReminder />
      <EmailCapturePopup />
      <LiveChat />
      <AnalyticsScripts />
    </ClientWrapper>
  );
}
