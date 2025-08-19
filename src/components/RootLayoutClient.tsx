'use client'

import { ReactNode, useEffect } from 'react'
import { CartProvider } from '@/context/cartContext'
import { ThemeProvider } from '@/context/themeContext'

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  // Optionnel : conserver ta logique de thème au premier rendu
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const saved = localStorage.getItem('theme')
    const isDark = saved ? saved === 'dark' : prefersDark
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  return (
    <ThemeProvider>
      {/* ✅ Fournit le contexte panier à TOUTE l’app (Header, StickyCart, etc.) */}
      <CartProvider>
        {children}
      </CartProvider>
    </ThemeProvider>
  )
}
