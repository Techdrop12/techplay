import LocaleProvider from '../../../i18n'
import '@/styles/globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ClientWrapper from '../ClientWrapper'
import useAnalytics from '../../lib/useAnalytics'
import PromoBanner from '@/components/PromoBanner'
import LiveChat from '@/components/LiveChat'
import EmailCapturePopup from '@/components/EmailCapturePopup' // ✅ modifié ici
import CartReminder from '@/components/CartReminder'
import FreeShippingBadge from '@/components/FreeShippingBadge'

function LayoutWithAnalytics({ children }) {
  useAnalytics()

  return (
    <ClientWrapper>
      <PromoBanner />
      <EmailCapturePopup /> {/* ✅ modifié ici */}
      <CartReminder />
      <LiveChat />
      <Header />
      {children}
      <Footer />
    </ClientWrapper>
  )
}

export default function LocaleLayout({ children, params: { locale } }) {
  return (
    <html lang={locale}>
      <body>
        <LocaleProvider locale={locale}>
          <LayoutWithAnalytics>{children}</LayoutWithAnalytics>
        </LocaleProvider>
        <FreeShippingBadge />
      </body>
    </html>
  )
}
