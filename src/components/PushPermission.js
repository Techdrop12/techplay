'use client'

import { useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export default function PushPermission() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      !('serviceWorker' in navigator)
    )
      return

    Notification.requestPermission().then(async (permission) => {
      if (permission !== 'granted') return

      try {
        const app = initializeApp(firebaseConfig)
        const messaging = getMessaging(app)

        const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
        const token = await getToken(messaging, {
          vapidKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY),
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
          console.log('🔔 Notification reçue:', payload)
          alert(payload.notification?.title || 'Nouvelle notification')
        })
      } catch (err) {
        console.error('❌ Erreur push permission:', err)
      }
    })
  }, [])

  return null
}
