// src/app/layout.js
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ClientWrapper from './ClientWrapper'

export const metadata = {
  title: 'TechPlay',
  description: 'TechPlay – Boutique high-tech',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <ClientWrapper>
          <Header />
          {children}
          <Footer />
        </ClientWrapper>
      </body>
    </html>
  )
}
