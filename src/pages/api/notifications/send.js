import { messaging } from '@/lib/firebase-admin'
import { getAllTokens } from './save-token'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { title, body, url } = req.body
  const tokens = getAllTokens()

  if (!tokens.length) return res.status(400).json({ error: 'Aucun token enregistré' })

  const message = {
    notification: { title, body },
    webpush: {
      fcmOptions: { link: url || 'https://techplay.com' },
    },
    tokens,
  }

  try {
    const result = await messaging.sendMulticast(message)
    res.status(200).json({ success: true, result })
  } catch (err) {
    console.error('Push error:', err)
    res.status(500).json({ error: 'Erreur envoi push' })
  }
}
