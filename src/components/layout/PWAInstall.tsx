'use client'
import { useEffect, useState } from 'react'

declare global { interface Window { __TP_INSTALL_SEEN?: boolean } }

export default function PWAInstall() {
  const [prompt, setPrompt] = useState<any>(null)

  useEffect(() => {
    const onBeforeInstall = (e: any) => {
      // si un autre prompt (AppInstallPrompt) a déjà “pris” l’événement, on ne double pas
      if (window.__TP_INSTALL_SEEN) return
      e.preventDefault()
      window.__TP_INSTALL_SEEN = true
      setPrompt(e)
    }
    const onInstalled = () => { setPrompt(null); window.__TP_INSTALL_SEEN = true }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!prompt) return null

  const install = async () => {
    try { await prompt.prompt(); await prompt.userChoice } finally { setPrompt(null) }
  }

  return (
    <button
      onClick={install}
      className="fixed bottom-4 right-4 z-toast rounded-full bg-accent px-4 py-2 text-white shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
    >
      Installer l’app
    </button>
  )
}
