'use client'

import { useTheme } from '@/context/themeContext'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      aria-label="Basculer le thème"
      className="transition duration-300 rounded-full p-2 text-xl border hover:scale-105 bg-white text-black dark:bg-gray-800 dark:text-white"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
