import admin from '../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const { fcmToken, title, body, data } = req.body;
  if (!fcmToken || !title || !body) {
    return res
      .status(400)
      .json({ error: 'Paramètres manquants : fcmToken, title et body sont requis.' });
  }

  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: data || {},
    };

    const response = await admin.messaging().send(message);
    return res.status(200).json({ message: 'Notification envoyée', response });
  } catch (error) {
    console.error('❌ Erreur envoi push :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
}
