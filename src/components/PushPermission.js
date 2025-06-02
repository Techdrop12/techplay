'use client'

import { useEffect } from 'react'
import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'

export default function PushPermission() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      !('serviceWorker' in navigator)
    ) {
      return
    }

    const initPush = async () => {
      try {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          console.warn('❌ Permission de notification refusée')
          return
        }

        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        }

        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
        const supported = await isSupported()
        if (!supported) {
          console.warn('❌ Firebase messaging non supporté')
          return
        }

        const messaging = getMessaging(app)
        const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: reg,
        })

        if (token) {
          console.log('✅ Token Firebase obtenu :', token)
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
      } catch (error) {
        console.error('❌ Erreur permission push :', error)
      }
    }

    initPush()
  }, [])

  return null
}
