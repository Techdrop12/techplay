/* public/firebase-messaging-sw.js */

// Chargement des SDKs Firebase en mode compatibilité (support large)
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// Configuration Firebase (doit matcher .env.local)
firebase.initializeApp({
  apiKey: "AIzaSyCdv0yQWJCIEgUVcynrQgw4rXn5xGKXag0",
  authDomain: "techplay-7f25c.firebaseapp.com",
  projectId: "techplay-7f25c",
  messagingSenderId: "835420975485",
  appId: "1:835420975485:web:f97ae250aeaf2de44bdc14"
})

// Initialisation Firebase Messaging
const messaging = firebase.messaging()

// Gérer les messages reçus lorsque l'app est en arrière-plan ou fermée
messaging.onBackgroundMessage((payload) => {
  console.log('🔕 Notification reçue en arrière-plan :', payload)

  const notification = payload.notification || {
    title: 'Nouvelle notification',
    body: 'Consultez TechPlay pour plus d’infos.',
  }

  self.registration.showNotification(notification.title, {
    body: notification.body,
    icon: '/logo.png',
  })
})
