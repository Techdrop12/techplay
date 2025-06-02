// src/pages/api/notifications/send.js

import { getMessaging } from 'firebase-admin/messaging'
import { getApp, getApps, initializeApp, cert } from 'firebase-admin/app'
import { getAllTokens, deleteToken } from './save-token'

// Initialise Firebase admin s’il n’est pas déjà initialisé
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { title, body, url } = req.body

  if (!title || !body) {
    return res.status(400).json({ error: 'Titre et contenu requis.' })
  }

  const tokens = getAllTokens()
  if (!tokens.length) {
    return res.status(400).json({ error: 'Aucun token enregistré.' })
  }

  const message = {
    notification: { title, body },
    webpush: {
      fcmOptions: {
        link: url || 'https://techplay.com',
      },
    },
    tokens,
  }

  try {
    const messaging = getMessaging()
    const result = await messaging.sendMulticast(message)

    // ✅ Supprimer les tokens invalides
    result.responses.forEach((resp, index) => {
      const errCode = resp.error?.code || ''
      const invalidToken =
        errCode.includes('invalid-registration-token') ||
        errCode.includes('registration-token-not-registered')

      if (!resp.success && invalidToken) {
        deleteToken(tokens[index])
      }
    })

    res.status(200).json({
      success: true,
      sent: result.successCount,
      failed: result.failureCount,
    })
  } catch (error) {
    console.error('❌ Erreur envoi push :', error)
    res.status(500).json({ error: 'Erreur interne lors de l’envoi' })
  }
}
