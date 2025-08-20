'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { CartProvider } from '@/context/cartContext'
import { ThemeProvider } from '@/context/themeContext'

type Props = { children: ReactNode }

const THEME_KEY = 'theme' // 'light' | 'dark' | 'system'

/** Applique le thème à <html> (classe, data, color-scheme) */
function applyTheme(mode: 'light' | 'dark') {
  const root = document.documentElement
  const isDark = mode === 'dark'
  root.classList.toggle('dark', isDark)
  root.setAttribute('data-theme', mode)
  // pour que les UA styles (scrollbar, form controls) suivent
  root.style.colorScheme = isDark ? 'dark' : 'light'
}

export default function RootLayoutClient({ children }: Props) {
  // ———————————— THEME BOOTSTRAP + SYNC ————————————
  useEffect(() => {
    const mqDark = window.matchMedia?.('(prefers-color-scheme: dark)')
    const mqReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')

    // expose quelques infos utiles aux CSS/JS
    const setMotionAttr = () => {
      document.documentElement.setAttribute(
        'data-reduced-motion',
        mqReduce?.matches ? 'reduce' : 'no-preference'
      )
    }

    const getSaved = () => {
      try {
        return (localStorage.getItem(THEME_KEY) || 'system') as 'light' | 'dark' | 'system'
      } catch {
        return 'system'
      }
    }

    const resolveMode = (pref: 'light' | 'dark' | 'system') =>
      pref === 'system' ? (mqDark?.matches ? 'dark' : 'light') : pref

    // Initial
    setMotionAttr()
    applyTheme(resolveMode(getSaved()))

    // Si le user n’a pas figé un thème (ou choisit "system"), on suit l’OS
    const onSchemeChange = () => {
      const saved = getSaved()
      if (saved === 'system') applyTheme(resolveMode(saved))
    }

    // Synchronise entre onglets/fenêtres
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY) {
        const next = (e.newValue || 'system') as 'light' | 'dark' | 'system'
        applyTheme(resolveMode(next))
      }
    }

    mqDark?.addEventListener?.('change', onSchemeChange)
    mqReduce?.addEventListener?.('change', setMotionAttr)
    window.addEventListener('storage', onStorage)

    return () => {
      mqDark?.removeEventListener?.('change', onSchemeChange)
      mqReduce?.removeEventListener?.('change', setMotionAttr)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  // ———————————— 100svh mobile (iOS safe) ————————————
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
    setVH()
    window.addEventListener('resize', setVH)
    window.addEventListener('orientationchange', setVH)
    return () => {
      window.removeEventListener('resize', setVH)
      window.removeEventListener('orientationchange', setVH)
    }
  }, [])

  return (
    <ThemeProvider>
      {/* ✅ Fournit le contexte panier à TOUTE l’app (Header, StickyCart, etc.) */}
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  )
}
