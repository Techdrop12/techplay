/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// Initialisation Firebase pour le SW
firebase.initializeApp({
  apiKey: "AIzaSyCdv0yQWJCIEgUVcynrQgw4rXn5xGKXag0",
  authDomain: "techplay-7f25c.firebaseapp.com",
  projectId: "techplay-7f25c",
  messagingSenderId: "835420975485",
  appId: "1:835420975485:web:f97ae250aeaf2de44bdc14"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 📩 Notification reçue en arrière-plan :', payload)

  const notificationTitle = payload.notification?.title || 'Nouvelle notification'
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/icons/icon-192x192.png'
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
