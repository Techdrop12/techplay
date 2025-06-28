// ✅ /src/pages/api/send-push.js (envoi notification web push, bonus admin)
import { sendWebPush } from '@/lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { title, body, tokens } = req.body;
  if (!title || !body || !tokens || !tokens.length) {
    return res.status(400).json({ error: 'Invalid params' });
  }
  try {
    const result = await sendWebPush({ title, body, tokens });
    res.status(200).json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
