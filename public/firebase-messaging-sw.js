/* public/firebase-messaging-sw.js */

// Utilisation des versions compat pour support large
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// Configuration Firebase (doit être cohérente avec .env.local)
firebase.initializeApp({
  apiKey: "AIzaSyCdv0yQWJCIEgUVcynrQgw4rXn5xGKXag0",
  authDomain: "techplay-7f25c.firebaseapp.com",
  projectId: "techplay-7f25c",
  messagingSenderId: "835420975485",
  appId: "1:835420975485:web:f97ae250aeaf2de44bdc14",
})

// Initialisation du messaging
const messaging = firebase.messaging()

// Réception d'une notification quand le site est fermé
messaging.onBackgroundMessage((payload) => {
  console.log('🔕 Notification reçue en arrière-plan :', payload)
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/logo.png',
  })
})
