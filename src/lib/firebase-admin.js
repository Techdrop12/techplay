// Firebase Admin – envoi de notifications push
import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export function sendWebPush(token, payload) {
  return getMessaging().send({
    token,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    webpush: {
      fcmOptions: { link: payload.url },
    },
  });
}

export { getMessaging };
