'use client'

import { useEffect } from 'react'
import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'

export default function PushPermission() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    const init = async () => {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      try {
        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        }

        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
        const supported = await isSupported()
        if (!supported) return

        const messaging = getMessaging(app)

        const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
        await navigator.serviceWorker.ready

        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: reg,
        })

        if (token) {
          await fetch('/api/notifications/save-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          })
        }

        onMessage(messaging, (payload) => {
          console.log('🔔 Notification reçue :', payload)
          alert(payload.notification?.title || 'Nouvelle notification')
        })
      } catch (err) {
        console.error('❌ Erreur permission push :', err)
      }
    }

    init()
  }, [])

  return null
}
