// ✅ /src/pages/api/notifications/send.js (envoi notification web push)
import webpush from 'web-push';

const tokens = new Set();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Missing params' });

  const payload = JSON.stringify({ title, body });

  try {
    let success = 0, fail = 0;
    for (const token of tokens) {
      try {
        await webpush.sendNotification(token, payload);
        success++;
      } catch (e) {
        fail++;
      }
    }
    res.status(200).json({ success, fail });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
