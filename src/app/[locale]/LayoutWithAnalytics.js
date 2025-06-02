'use client'

import ClientWrapper from '@/components/ClientWrapper'
import PromoBanner from '@/components/PromoBanner'
import EmailCapturePopup from '@/components/EmailCapturePopup'
import CartReminder from '@/components/CartReminder'
import LiveChat from '@/components/LiveChat'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import useAnalytics from '@/lib/useAnalytics'
import AnalyticsScripts from '@/components/AnalyticsScripts'
// Optionnel : import ScrollToTopButton from '@/components/ScrollToTopButton'

export default function LayoutWithAnalytics({ children }) {
  useAnalytics()

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
      {/* <ScrollToTopButton /> */}
    </ClientWrapper>
  )
}
