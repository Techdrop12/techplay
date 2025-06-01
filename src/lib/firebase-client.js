import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

let messaging = null
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app)
  } else {
    console.warn('❌ Notifications push non supportées dans ce navigateur.')
  }
})

export async function requestPermission() {
  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted' && messaging) {
      const token = await getToken(messaging, {
        vapidKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY),
      })
      return token
    }
  } catch (err) {
    console.error('❌ Erreur push permission:', err)
  }
}

export { messaging, onMessage }
