'use client'

import { useEffect, useState } from 'react'

export default function DarkToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(stored ? stored === 'dark' : prefersDark)
  }, [])

  const toggle = () => {
    const newTheme = isDark ? 'light' : 'dark'
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', !isDark)
    setIsDark(!isDark)
  }

  return (
    <button onClick={toggle} className="ml-4 text-sm underline">
      {isDark ? 'Mode clair' : 'Mode sombre'}
    </button>
  )
}
