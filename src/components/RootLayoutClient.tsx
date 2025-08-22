// src/components/RootLayoutClient.tsx
'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { CartProvider } from '@/context/cartContext'
import { ThemeProvider } from '@/context/themeContext'

type Props = { children: ReactNode }

export default function RootLayoutClient({ children }: Props) {
  // ——— Attributs UA (motion/contrast/pointer/gamut/online) ———
  useEffect(() => {
    const root = document.documentElement

    const mqReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null
    const mqContrast = window.matchMedia?.('(prefers-contrast: more)') ?? null
    const mqPointerCoarse = window.matchMedia?.('(pointer: coarse)') ?? null
    const mqGamutP3 = window.matchMedia?.('(color-gamut: p3)') ?? null

    const setMotionAttr  = () => root.setAttribute('data-reduced-motion', mqReduce?.matches ? 'reduce' : 'no-preference')
    const setContrastAttr = () => root.setAttribute('data-contrast', mqContrast?.matches ? 'more' : 'standard')
    const setPointerAttr  = () => root.setAttribute('data-pointer', mqPointerCoarse?.matches ? 'coarse' : 'fine')
    const setGamutAttr    = () => root.setAttribute('data-gamut', mqGamutP3?.matches ? 'p3' : 'srgb')
    const setOnlineAttr   = () => root.setAttribute('data-online', navigator.onLine ? 'true' : 'false')

    setMotionAttr(); setContrastAttr(); setPointerAttr(); setGamutAttr(); setOnlineAttr()

    mqReduce?.addEventListener?.('change', setMotionAttr)
    mqContrast?.addEventListener?.('change', setContrastAttr)
    mqPointerCoarse?.addEventListener?.('change', setPointerAttr)
    mqGamutP3?.addEventListener?.('change', setGamutAttr)
    window.addEventListener('online', setOnlineAttr)
    window.addEventListener('offline', setOnlineAttr)

    return () => {
      mqReduce?.removeEventListener?.('change', setMotionAttr)
      mqContrast?.removeEventListener?.('change', setContrastAttr)
      mqPointerCoarse?.removeEventListener?.('change', setPointerAttr)
      mqGamutP3?.removeEventListener?.('change', setGamutAttr)
      window.removeEventListener('online', setOnlineAttr)
      window.removeEventListener('offline', setOnlineAttr)
    }
  }, [])

  // ——— 100svh mobile (iOS & clavier virtuel) ———
  useEffect(() => {
    const root = document.documentElement
    const setVH = () => {
      const vv = window.visualViewport
      const height = vv ? vv.height : window.innerHeight
      root.style.setProperty('--vh', `${(height * 0.01).toString()}px`)
    }
    setVH()
    const vv = window.visualViewport
    vv?.addEventListener('resize', setVH)
    vv?.addEventListener('scroll', setVH)
    window.addEventListener('resize', setVH)
    window.addEventListener('orientationchange', setVH)
    return () => {
      vv?.removeEventListener('resize', setVH)
      vv?.removeEventListener('scroll', setVH)
      window.removeEventListener('resize', setVH)
      window.removeEventListener('orientationchange', setVH)
    }
  }, [])

  // ——— Portal root (modals, toasts custom, etc.) ———
  useEffect(() => {
    const id = 'portal-root'
    if (!document.getElementById(id)) {
      const el = document.createElement('div')
      el.id = id
      el.setAttribute('data-portal-root', 'true')
      document.body.appendChild(el)
    }
  }, [])

  return (
    <ThemeProvider>
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  )
}
