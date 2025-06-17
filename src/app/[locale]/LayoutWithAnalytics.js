'use client';

import ClientWrapper from '@/components/ClientWrapper';
import PromoBanner from '@/components/PromoBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartReminder from '@/components/CartReminder';
import EmailCapturePopup from '@/components/EmailCapturePopup';
import LiveChat from '@/components/LiveChat';
import useAnalytics from '@/lib/useAnalytics';
import CartAbandonTrigger from '@/components/CartAbandonTrigger';
import ScrollProgress from '@/components/ScrollProgress';
import BackToTop from '@/components/BackToTop';
import PageTransitions from '@/components/PageTransitions';
import LoaderOverlay from '@/components/LoaderOverlay';
import ToastNotification from '@/components/ToastNotification';

export default function LayoutWithAnalytics({ children }) {
  useAnalytics();

  return (
    <ClientWrapper>
      <PromoBanner />
      <ScrollProgress />
      <Header />
      <CartAbandonTrigger />
      <PageTransitions>
        <main className="min-h-screen pt-header animate-fadeIn">
          {children}
        </main>
      </PageTransitions>
      <Footer />
      <BackToTop />
      <CartReminder />
      <EmailCapturePopup />
      <LiveChat />
      <ToastNotification />
      <LoaderOverlay />
    </ClientWrapper>
  );
}
