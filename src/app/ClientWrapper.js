'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/context/cartContext'
import { ThemeProvider } from '@/context/themeContext'

export default function ClientWrapper({ children }) {
  const pathname = usePathname()

  useEffect(() => {
    // Débogage ou analyse optionnelle
    console.log('Navigation vers', pathname)
  }, [pathname])

  return (
    <ThemeProvider>
      <CartProvider>
        {children}
        <Toaster position="top-right" />
      </CartProvider>
    </ThemeProvider>
  )
}