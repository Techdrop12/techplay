// src/components/AfterIdleClient.tsx — FINAL+ (idle mount + SW register/updates)
'use client'

import { ReactNode, useEffect, useState, useRef } from 'react'

export default function AfterIdleClient({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const reloadedRef = useRef(false)

  useEffect(() => {
    const ric: any = (window as any).requestIdleCallback ?? ((cb: any) => setTimeout(cb, 1))
    const id = ric(() => setReady(true))
    return () => {
      ;(window as any).cancelIdleCallback?.(id)
      clearTimeout(id)
    }
  }, [])

  // Enregistrement SW après idle
  useEffect(() => {
    if (!ready) return
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        // L’URL standard générée par next-pwa
        const swUrl = '/sw.js'
        const reg = await navigator.serviceWorker.register(swUrl, { scope: '/' })

        // Si un SW "waiting" existe déjà => active immédiatement
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' })
        }

        // Nouveau SW trouvé
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing
          if (!nw) return
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              // Un nouveau SW est prêt -> active tout de suite
              reg.waiting?.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })

        // Quand le contrôleur change (nouvel SW actif), recharge une fois
        const onCtrl = () => {
          if (reloadedRef.current) return
          reloadedRef.current = true
          // Petit délai pour laisser l’activation se terminer proprement
          setTimeout(() => window.location.reload(), 80)
        }
        navigator.serviceWorker.addEventListener('controllerchange', onCtrl)
        return () => navigator.serviceWorker.removeEventListener('controllerchange', onCtrl)
      } catch {}
    }

    const idle = (cb: () => void) =>
      ('requestIdleCallback' in window ? (window as any).requestIdleCallback(cb) : setTimeout(cb, 500))

    const id = idle(register)
    return () => {
      ;(window as any).cancelIdleCallback?.(id)
      clearTimeout(id)
    }
  }, [ready])

  if (!ready) return null
  return <>{children}</>
}
