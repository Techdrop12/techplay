/* eslint-disable no-undef */
// Service Worker Firebase Messaging (FCM) – v10.12.0 « compat »

// Importe les librairies « compat » pour pouvoir utiliser firebase.messaging() dans un SW.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialise Firebase dans le Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyCdv0yQWJCIEgUVcynrQgw4rXn5xGKXag0",
  authDomain: "techplay-7f25c.firebaseapp.com",
  projectId: "techplay-7f25c",
  messagingSenderId: "835420975485",
  appId: "1:835420975485:web:f97ae250aeaf2de44bdc14",
  // (optionnel) measurementId: "G-5GBPGDN49Q"
});

const messaging = firebase.messaging();

// Lorsqu’une notification arrive en arrière-plan (onglet fermé ou non focalisé)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 📩 Notification reçue en arrière-plan :', payload);

  const notificationTitle = payload.notification?.title || 'Nouvelle notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/icons/icon-192x192.png' // Vérifiez que ce chemin existe dans public/icons/
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
