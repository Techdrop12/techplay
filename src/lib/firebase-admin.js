// ✅ /src/lib/firebase-admin.js (notifications push, admin)
import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

let app;
if (!getApps().length) {
  app = initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export { getMessaging };
