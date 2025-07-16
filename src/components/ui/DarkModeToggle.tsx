'use client'
import { useEffect, useState } from 'react'

export default function DarkModeToggle() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const system = prefersDark ? 'dark' : 'light'
    setTheme(stored || system)
    document.documentElement.classList.toggle('dark', (stored || system) === 'dark')
  }, [])

  const toggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
  }

  return (
    <button onClick={toggle} className="text-sm text-gray-600 dark:text-gray-300 underline">
      Mode {theme === 'dark' ? 'clair' : 'sombre'}
    </button>
  )
}
