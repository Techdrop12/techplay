// ✅ public/firebase-messaging-sw.js

// Chargement des SDK Firebase en mode compatibilité
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// Configuration Firebase (identique à .env.local)
firebase.initializeApp({
  apiKey: "AIzaSyCdv0yQWJCIEgUVcynrQgw4rXn5xGKXag0",
  authDomain: "techplay-7f25c.firebaseapp.com",
  projectId: "techplay-7f25c",
  messagingSenderId: "835420975485",
  appId: "1:835420975485:web:f97ae250aeaf2de44bdc14"
})

// Initialisation de Firebase Messaging
const messaging = firebase.messaging()

// 🔕 Gérer les notifications reçues en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('🔕 Notification reçue en arrière-plan :', payload)

  const notification = payload.notification || {
    title: 'Nouvelle notification',
    body: 'Consultez TechPlay pour plus d’infos.',
  }

  self.registration.showNotification(notification.title, {
    body: notification.body,
    icon: '/logo.png', // Remplace par ton icône
  })
})
