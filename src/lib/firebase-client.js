// src/lib/firebase-client.js
'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

let messaging = null;
let firebaseApp = null;

// S’exécute uniquement côté client
if (typeof window !== 'undefined') {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  if (!firebaseConfig.projectId) {
    console.warn('❌ Firebase config invalide : projectId manquant.');
  } else {
    try {
      // Initialise Firebase si ce n’est pas déjà fait
      firebaseApp = getApps().length === 0
        ? initializeApp(firebaseConfig)
        : getApps()[0];

      // Vérifie le support de Firebase Messaging dans ce navigateur
      isSupported()
        .then((supported) => {
          if (supported) {
            messaging = getMessaging(firebaseApp);
            console.log('✅ Firebase Messaging initialisé (client)');
          } else {
            console.warn('❌ Notifications push non supportées dans ce navigateur.');
          }
        })
        .catch((e) => {
          console.warn('❌ Erreur vérification support messaging :', e);
        });
    } catch (e) {
      console.error('❌ Erreur init Firebase (client) :', e);
    }
  }
}

// Fonction pour demander la permission, enregistrer le SW et récupérer le token
export async function requestAndSaveToken(serviceWorkerPath = '/firebase-messaging-sw.js') {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('⛔ Notifications non supportées dans ce contexte.');
    return null;
  }

  // Attendre que messaging soit initialisé (max 2 secondes)
  const waitForMessaging = () => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (messaging) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error('messaging non initialisé à temps'));
      }, 2000);
    });
  };

  try {
    await waitForMessaging();
  } catch (e) {
    console.warn('messaging a mis trop de temps à s’initialiser.', e);
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('❌ Permission de notification refusée');
      return null;
    }

    // Enregistre le Service Worker define dans /public/firebase-messaging-sw.js
    const registration = await navigator.serviceWorker.register(serviceWorkerPath);

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey || vapidKey.length < 80 || !vapidKey.startsWith('B')) {
      throw new Error('❌ VAPID_KEY non valide ou absente');
    }

    // Récupère le token FCM
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('✅ Token Firebase obtenu :', token);
      // Envoie le token à votre endpoint (API) pour l’enregistrer en base
      await fetch('/api/notifications/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    }

    return token;
  } catch (error) {
    console.error('❌ Erreur récupération token Firebase :', error);
    return null;
  }
}

// Écoute les notifications lorsqu’un message arrive en foreground
export function listenToMessages() {
  if (typeof window !== 'undefined' && messaging) {
    onMessage(messaging, (payload) => {
      console.log('🔔 Notification reçue (foreground) :', payload);
      // Ici, vous pouvez déclencher un toast/snackbar dans l’UI si besoin.
    });
  }
}

export { messaging };
export default firebaseApp;
