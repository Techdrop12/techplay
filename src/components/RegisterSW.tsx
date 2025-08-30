// src/components/RegisterSW.tsx — robuste (updates + skipWaiting + reload sûr)
'use client'
import { useEffect, useRef } from 'react'

export default function RegisterSW() {
  const reloaded = useRef(false)

  useEffect(() => {
    // En dev, next-pwa est désactivé → évite un register 404
    if (process.env.NODE_ENV === 'development') return
    if (!('serviceWorker' in navigator)) return

    const url = '/sw.js'

    const sendSkipWaiting = async (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' })
    }

    const handleControllerChange = () => {
      if (reloaded.current) return
      reloaded.current = true
      // reload doux après update de SW
      window.location.reload()
    }

    const doReg = async () => {
      try {
        const reg = await navigator.serviceWorker.register(url)
        // Mise à jour périodique
        setInterval(() => reg.update().catch(() => {}), 15 * 60 * 1000)

        // Auto-skipWaiting si un SW attend
        await sendSkipWaiting(reg)

        // Suivre les updates
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing
          if (!installing) return
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              sendSkipWaiting(reg)
            }
          })
        })

        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
      } catch {
        // silencieux
      }
    }

    doReg()
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [])

  return null
}
