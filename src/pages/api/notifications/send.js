// ✅ src/pages/api/notifications/send.js

import { messaging } from '@/lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, title, body } = req.body;
  if (!token || !title || !body) return res.status(400).json({ error: 'Missing fields' });

  await messaging.send({
    token,
    notification: { title, body }
  });

  res.status(200).json({ ok: true });
}
