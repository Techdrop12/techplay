'use client'

import ClientWrapper from '../ClientWrapper'
import PromoBanner from '@/components/PromoBanner'
import EmailCapturePopup from '@/components/EmailCapturePopup'
import CartReminder from '@/components/CartReminder'
import LiveChat from '@/components/LiveChat'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import useAnalytics from '@/lib/useAnalytics'

export default function LayoutWithAnalytics({ children }) {
  useAnalytics()

  return (
    <ClientWrapper>
      <PromoBanner />
      <EmailCapturePopup />
      <CartReminder />
      <LiveChat />
      <Header />
      {children}
      <Footer />
    </ClientWrapper>
  )
}
