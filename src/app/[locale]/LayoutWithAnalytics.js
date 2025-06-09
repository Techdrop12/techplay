'use client';

import ClientWrapper from '@/components/ClientWrapper';
import PromoBanner from '@/components/PromoBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartReminder from '@/components/CartReminder';
import EmailCapturePopup from '@/components/EmailCapturePopup';
import LiveChat from '@/components/LiveChat';
import useAnalytics from '@/lib/useAnalytics';

export default function LayoutWithAnalytics({ children }) {
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
    </ClientWrapper>
  );
}
