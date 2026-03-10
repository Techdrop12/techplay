// src/components/AfterIdleClient.tsx
'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

function scheduleWhenIdle(cb: () => void, timeout = 1): number {
  if (typeof window === 'undefined') return 0

  if (typeof window.requestIdleCallback === 'function') {
    return window.requestIdleCallback(() => cb(), { timeout })
  }

  return window.setTimeout(cb, timeout)
}

function cancelScheduledWork(id: number) {
  if (typeof window === 'undefined') return

  if (typeof window.cancelIdleCallback === 'function') {
    window.cancelIdleCallback(id)
    return
  }

  window.clearTimeout(id)
}

export default function AfterIdleClient({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const reloadedRef = useRef(false)

  useEffect(() => {
    const id = scheduleWhenIdle(() => setReady(true), 1)
    return () => cancelScheduledWork(id)
  }, [])

  useEffect(() => {
    if (!ready) return
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    let cancelled = false
    let removeControllerChange: (() => void) | undefined

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        if (cancelled) return

        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' })
        }

        reg.addEventListener('updatefound', () => {
          const nextWorker = reg.installing
          if (!nextWorker) return

          nextWorker.addEventListener('statechange', () => {
            if (nextWorker.state === 'installed' && navigator.serviceWorker.controller) {
              reg.waiting?.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })

        const onControllerChange = () => {
          if (reloadedRef.current) return
          reloadedRef.current = true
          window.setTimeout(() => window.location.reload(), 80)
        }

        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
        removeControllerChange = () => {
          navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
        }
      } catch {}
    }

    const id = scheduleWhenIdle(() => {
      void register()
    }, 500)

    return () => {
      cancelled = true
      removeControllerChange?.()
      cancelScheduledWork(id)
    }
  }, [ready])

  if (!ready) return null
  return <>{children}</>
}