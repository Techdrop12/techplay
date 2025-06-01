// src/lib/firebase-client.js
'use client'

import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// ✅ Initialise Firebase uniquement si côté client
let messaging
let firebaseApp

if (typeof window !== 'undefined') {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }

  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  messaging = getMessaging(firebaseApp)
}

// ✅ Requête de permission + enregistrement du token
export async function requestAndSaveToken(serviceWorkerPath = '/firebase-messaging-sw.js') {
  if (typeof window === 'undefined' || !('Notification' in window)) return null

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    console.warn('Permission de notification refusée')
    return null
  }

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
    console.error('❌ Erreur lors de la génération du token Firebase :', error)
    return null
  }
}

// ✅ Optionnel : écoute des messages push pendant que le site est ouvert
export function listenToMessages() {
  if (typeof window !== 'undefined' && messaging) {
    onMessage(messaging, (payload) => {
      console.log('🔔 Notification reçue (foreground) :', payload)
    })
  }
}

export { messaging }
export default firebaseApp
