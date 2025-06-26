// ✅ src/app/[locale]/LayoutWithAnalytics.js

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LiveChat from '@/components/LiveChat';
import CartReminder from '@/components/CartReminder';
import ScrollToTop from '@/components/ScrollToTop';
import ToastContainer from '@/components/ToastContainer';
import { useAnalytics } from '@/lib/useAnalytics';

export default function LayoutWithAnalytics({ children, locale }) {
  useAnalytics(locale);

  return (
    <>
      <Header locale={locale} />
      <main>{children}</main>
      <Footer locale={locale} />
      <LiveChat />
      <CartReminder />
      <ToastContainer />
      <ScrollToTop />
    </>
  );
}
