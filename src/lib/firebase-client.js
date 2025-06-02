'use client'

import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'

let messaging = null
let firebaseApp = null

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

  if (!firebaseConfig.projectId) {
    console.warn('❌ Firebase config invalide : projectId manquant.')
  } else {
    try {
      firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

      isSupported()
        .then((supported) => {
          if (supported) {
            messaging = getMessaging(firebaseApp)
            console.log('✅ Firebase Messaging initialisé (client)')
          } else {
            console.warn('❌ Notifications push non supportées dans ce navigateur.')
          }
        })
        .catch((e) => {
          console.warn('❌ Erreur vérification support messaging :', e)
        })
    } catch (e) {
      console.error('❌ Erreur init Firebase (client) :', e)
    }
  }
}

export async function requestAndSaveToken(serviceWorkerPath = '/firebase-messaging-sw.js') {
  if (typeof window === 'undefined' || !('Notification' in window) || !messaging) {
    console.warn('⛔ Notifications non supportées dans ce contexte.')
    return null
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('❌ Permission de notification refusée')
      return null
    }

    const registration = await navigator.serviceWorker.register(serviceWorkerPath)
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

    if (!vapidKey || vapidKey.length < 10) {
      throw new Error('❌ VAPID_KEY non valide ou absente')
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    })

    if (token) {
      console.log('✅ Token Firebase obtenu :', token)
      await fetch('/api/notifications/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
    }

    return token
  } catch (error) {
    console.error('❌ Erreur récupération token Firebase :', error)
    return null
  }
}

export function listenToMessages() {
  if (typeof window !== 'undefined' && messaging) {
    onMessage(messaging, (payload) => {
      console.log('🔔 Notification reçue (foreground) :', payload)
    })
  }
}

export { messaging }
export default firebaseApp
