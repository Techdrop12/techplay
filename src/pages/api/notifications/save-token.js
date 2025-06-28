// ✅ /src/pages/api/notifications/save-token.js (sauvegarde des tokens web push utilisateurs)
const tokens = new Set();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Missing token' });
  tokens.add(token);
  res.status(200).json({ success: true });
}
