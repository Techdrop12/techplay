// ✅ src/lib/firebase-client.js

import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'

// Config Firebase (client)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialisation Firebase
const app = initializeApp(firebaseConfig)

// Vérifie la compatibilité du navigateur avec les notifications
let messaging = null
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app)
  } else {
    console.warn('❌ Notifications push non supportées dans ce navigateur.')
  }
})

// ✅ Demande permission et envoie le token au backend
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') throw new Error('Permission refusée par l’utilisateur.')

    if (!messaging) throw new Error('Firebase Messaging non initialisé')

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    const token = await getToken(messaging, {
      vapidKey,
    })

    if (!token) throw new Error('Aucun token généré')

    await fetch('/api/notifications/save-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    return token
  } catch (err) {
    console.error('❌ Erreur lors de la permission ou de l’enregistrement du token :', err)
    return null
  }
}

// Export messaging & listener
export { messaging, onMessage }
