// ✅ /src/app/[locale]/LayoutWithAnalytics.js (header, footer, toasts, live chat, cart, analytics, PWA, bonus)
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/ToastContainer';
import LiveChat from '@/components/LiveChat';
import CartReminder from '@/components/CartReminder';
import ScrollToTop from '@/components/ScrollToTop';

export default function LayoutWithAnalytics({ children, locale }) {
  return (
    <>
      <Header locale={locale} />
      <main className="min-h-[70vh]">{children}</main>
      <Footer locale={locale} />
      <ToastContainer />
      <LiveChat />
      <CartReminder />
      <ScrollToTop />
    </>
  );
}
