'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
  /** Affiche uniquement l’icône (sinon texte) */
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

function getSystemPref(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle({ className, iconOnly = true, size = 'md' }: Props) {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
      const initial = saved ?? getSystemPref()
      applyTheme(initial)
    } catch {
      applyTheme(getSystemPref())
    }
    // Sync si l’utilisateur change la préférence système en live
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const saved = localStorage.getItem('theme')
      if (!saved) applyTheme(getSystemPref())
    }
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyTheme = (t: 'light' | 'dark') => {
    const html = document.documentElement
    html.classList.toggle('dark', t === 'dark')
    setTheme(t)
  }

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    try {
      localStorage.setItem('theme', next)
    } catch {}
  }

  if (!mounted) return null

  const sizes = {
    sm: 'p-1 text-base',
    md: 'p-2 text-xl',
    lg: 'p-3 text-2xl',
  }

  return (
    <button
      onClick={toggle}
      aria-label="Basculer le thème"
      title={theme === 'dark' ? 'Passer en clair' : 'Passer en sombre'}
      className={cn(
        'rounded-full border transition bg-white text-black dark:bg-gray-800 dark:text-white hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        sizes[size],
        className
      )}
    >
      {iconOnly ? (theme === 'dark' ? '☀️' : '🌙') : theme === 'dark' ? '☀️ Clair' : '🌙 Sombre'}
    </button>
  )
}
