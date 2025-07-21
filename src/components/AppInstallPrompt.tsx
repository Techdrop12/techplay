'use client'

import { useEffect, useState } from 'react'
import { showToast } from '@/components/ToastSystem'
import Button from '@/components/Button'

export default function AppInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      showToast({ type: 'success', message: 'Installation réussie !' })
    } else {
      showToast({ type: 'info', message: 'Installation annulée.' })
    }

    setDeferredPrompt(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-900 border px-6 py-4 rounded shadow z-50">
      <p className="mb-2">Installer l'application TechPlay ?</p>
      <div className="flex gap-4">
        <Button variant="secondary" size="sm" onClick={() => setVisible(false)}>
          Plus tard
        </Button>
        <Button variant="primary" size="sm" onClick={handleInstall}>
          Installer
        </Button>
      </div>
    </div>
  )
}
