// src/lib/firebase-client.js

import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const messaging = getMessaging(firebaseApp)

export async function requestAndSaveToken(serviceWorkerPath = '/firebase-messaging-sw.js') {
  if (typeof window === 'undefined' || !('Notification' in window)) return

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  try {
    const registration = await navigator.serviceWorker.register(serviceWorkerPath)

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    })

    if (token) {
      await fetch('/api/notifications/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
    }

    return token
  } catch (error) {
    console.error('Erreur lors de la génération du token Firebase :', error)
    return null
  }
}
