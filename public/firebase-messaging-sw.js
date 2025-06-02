/* public/firebase-messaging-sw.js */

// ✅ SDKs Firebase pour Service Worker (compatibilité large)
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// ✅ Configuration Firebase (doit matcher le .env.local côté client)
firebase.initializeApp({
  apiKey: "AIzaSyCdv0yQWJCIEgUVcynrQgw4rXn5xGKXag0",
  authDomain: "techplay-7f25c.firebaseapp.com",
  projectId: "techplay-7f25c",
  messagingSenderId: "835420975485",
  appId: "1:835420975485:web:f97ae250aeaf2de44bdc14"
})

// ✅ Initialisation Messaging
const messaging = firebase.messaging()

// ✅ Gestion des notifications reçues en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('🔕 Notification reçue en arrière-plan :', payload)

  const notification = payload?.notification || {}
  const title = notification.title || 'Nouvelle notification'
  const body = notification.body || 'Consultez TechPlay pour plus d’infos.'

  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192x192.png', // 🔄 utilise l’icône PWA cohérente
    badge: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: { url: '/' },
  })
})
