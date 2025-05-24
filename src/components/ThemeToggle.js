'use client'

import { useTheme } from '@/context/themeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="border rounded px-2 py-1 bg-white text-black dark:bg-gray-800 dark:text-white"
    >
      {theme === 'dark' ? '☀️ Clair' : '🌙 Sombre'}
    </button>
  )
}
