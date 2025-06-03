/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// ✅ Initialisation Firebase
firebase.initializeApp({
  apiKey: "AIzaSyCdv0yQWJCIEgUVcynrQgw4rXn5xGKXag0",
  authDomain: "techplay-7f25c.firebaseapp.com",
  projectId: "techplay-7f25c",
  messagingSenderId: "835420975485",
  appId: "1:835420975485:web:f97ae250aeaf2de44bdc14"
})

// ✅ Service de réception des notifications en arrière-plan
const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 📩 Notification reçue en arrière-plan :', payload)

  const notificationTitle = payload.notification?.title || 'Nouvelle notification'
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/icons/icon-192x192.png',
    data: payload.data || {},
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// ✅ Ajout pour interaction (ex. : redirection à l’ouverture de notif)
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})
