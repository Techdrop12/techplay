// 📁 /src/app/layout.js
import './globals.css'
import { CartProvider } from '@/context/cartContext'
import { SessionProvider } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'TechPlay',
  description: 'E-commerce gaming et tech',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen bg-gray-100">{children}</main>
            <Footer />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
