// ✅ src/pages/api/notifications/save-token.js

let tokens = new Set();

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { token } = req.body;
    if (token) tokens.add(token);
    return res.status(200).json({ ok: true });
  }
  if (req.method === 'DELETE') {
    const { token } = req.body;
    if (token) tokens.delete(token);
    return res.status(200).json({ ok: true });
  }
  res.status(405).end();
}
