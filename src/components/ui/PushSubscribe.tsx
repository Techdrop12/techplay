// src/components/ui/PushSubscribe.tsx
'use client'

import { useCallback, useMemo, useState } from 'react'

import { error as logError, warn } from '@/lib/logger'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary')
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export default function PushSubscribe() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'enabled' | 'blocked' | 'unsupported'>('idle')

  const vapidKey = useMemo(() => (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '').trim(), [])

  const handleSubscribe = useCallback(async () => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported'); return
    }
    if (!vapidKey) { warn('Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY'); return }

    try {
      setLoading(true)

      // 1) Permission
      let permission = Notification.permission
      if (permission === 'default') {
        permission = await Notification.requestPermission()
      }
      if (permission !== 'granted') { setStatus('blocked'); return }

      // 2) SW prêt
      const reg = await navigator.serviceWorker.ready

      // 3) Déjà abonné ?
      const existing = await reg.pushManager.getSubscription()
      let sub = existing
      if (!existing) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })
      }

      // 4) Envoyer au backend
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub?.toJSON ? sub.toJSON() : sub),
        cache: 'no-store',
      }).catch(() => null)

      if (res && res.ok) setStatus('enabled')
    } catch (e) {
      logError('Push subscribe failed', e)
    } finally {
      setLoading(false)
    }
  }, [vapidKey])

  const label =
    status === 'enabled' ? 'Notifications activées ✔️'
    : status === 'blocked' ? 'Permission refusée'
    : status === 'unsupported' ? 'Notifications non prises en charge'
    : loading ? 'Activation…'
    : 'Activer les notifications'

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading || status === 'enabled' || status === 'unsupported'}
      className="text-sm underline disabled:opacity-60"
    >
      {label}
    </button>
  )
}
