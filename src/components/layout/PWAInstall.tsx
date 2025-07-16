'use client'
import { useEffect, useState } from 'react'

export default function PWAInstall() {
  const [prompt, setPrompt] = useState<any>(null)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setPrompt(e)
    })
  }, [])

  const install = () => {
    if (prompt) prompt.prompt()
  }

  if (!prompt) return null

  return (
    <button onClick={install} className="text-sm text-blue-600 underline">
      Installer l'app
    </button>
  )
}
