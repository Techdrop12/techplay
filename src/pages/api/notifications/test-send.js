import admin from '@/lib/firebase-admin'

let tokens = new Set()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  try {
    // Récupération des tokens (à adapter selon ton système de stockage)
    const allTokens = Array.from(tokens)

    if (allTokens.length === 0) {
      return res.status(400).json({ error: 'Aucun token enregistré' })
    }

    const message = {
      notification: {
        title: '🔔 Test Notification',
        body: 'Ceci est un message de test envoyé via Firebase Cloud Messaging.',
      },
      tokens: allTokens,
    }

    const response = await admin.messaging().sendMulticast(message)

    // Supprime les tokens invalides
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        console.warn('❌ Token invalide supprimé :', allTokens[idx])
        tokens.delete(allTokens[idx])
      }
    })

    res.status(200).json({
      successCount: response.successCount,
      failureCount: response.failureCount,
      message: 'Notifications envoyées',
    })
  } catch (error) {
    console.error('❌ Erreur envoi notification test :', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
