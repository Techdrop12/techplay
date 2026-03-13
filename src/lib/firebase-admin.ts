// src/lib/firebase-admin.ts
// @deprecated Non importé. À brancher si Firebase (auth/push) utilisé.
import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

function getCred() {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  const saB64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (sa || saB64) {
    const json = JSON.parse(sa || Buffer.from(saB64!, 'base64').toString('utf8'));
    return cert(json);
  }
  return applicationDefault();
}

if (!getApps().length) {
  initializeApp({
    credential: getCred(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export { getMessaging };

export interface WebPushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  image?: string;
}

export function sendWebPush(token: string, payload: WebPushPayload) {
  return getMessaging().send({
    token,
    notification: { title: payload.title, body: payload.body, imageUrl: payload.image },
    webpush: {
      fcmOptions: payload.url ? { link: payload.url } : undefined,
      notification: { icon: payload.icon },
    },
  });
}
