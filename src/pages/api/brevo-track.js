// ✅ /src/pages/api/brevo-track.js (tracking d’email Brevo / Sendinblue complet, logging + sauvegarde MongoDB)

import dbConnect from '@/lib/dbConnect';
import TrackingEvent from '@/models/TrackingEvent'; // À créer si pas déjà

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    await dbConnect();

    const { event, email, campaignId, metadata } = req.body;
    if (!event || !email) {
      return res.status(400).json({ error: 'Event et email requis' });
    }

    // Enregistre l’événement en base
    await TrackingEvent.create({
      event,
      email,
      campaignId: campaignId || null,
      metadata: metadata || {},
      createdAt: new Date(),
    });

    // Tu peux ajouter ici du logging externe/Analytics selon besoin
    res.status(200).json({ success: true });
  } catch (e) {
    console.error('Erreur tracking Brevo:', e);
    res.status(500).json({ error: e.message });
  }
}
