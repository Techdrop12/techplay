// ✅ src/pages/api/feedback.js

let FEEDBACK = [];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  FEEDBACK.push({
    feedback: req.body.feedback,
    createdAt: new Date().toISOString(),
  });
  res.status(200).json({ ok: true });
}
