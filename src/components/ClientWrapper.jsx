'use client';

import { useEffect } from 'react';
import { requestAndSaveToken, listenToMessages } from '@/src/lib/firebase-client';

export default function ClientWrapper({ children }) {
  useEffect(() => {
    // 1) Demander la permission Notification et enregistrer le token FCM
    requestAndSaveToken().then((token) => {
      if (token) {
        console.log('[ClientWrapper] Token FCM stocké avec succès :', token);
      }
    });

    // 2) Installer l’écouteur pour recevoir les notifications au premier plan
    listenToMessages();
  }, []);

  return <>{children}</>;
}
