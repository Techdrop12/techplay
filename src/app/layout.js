// src/app/layout.js
'use client'

import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ClientWrapper from './ClientWrapper'
import CartReminder from '@/components/CartReminder'
import EmailCapturePopup from '@/components/EmailCapturePopup'
import LiveChat from '@/components/LiveChat'
import { CartProvider } from '@/context/cartContext'
import StickyCartButton from '@/components/StickyCartButton'

export const metadata = {
  title: 'TechPlay',
  description: 'TechPlay 🛒 Boutique high-tech',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script src="/clarity.js" defer></script> {/* ✅ Clarity ajouté */}
      </head>
      <body className="bg-white text-black dark:bg-zinc-900 dark:text-white">
        <CartProvider>
          <ClientWrapper>
            <Header />
            {children}
            <Footer />
            <CartReminder />
            <EmailCapturePopup />
            <LiveChat />
            <StickyCartButton />
          </ClientWrapper>
        </CartProvider>
      </body>
    </html>
  )
}
