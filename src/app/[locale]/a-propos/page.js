export default function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' })
    }

    try {
      // Tu pourrais ici envoyer un email avec nodemailer ou enregistrer dans une base
      console.log('📨 Nouveau message de contact :', { name, email, message })

      return res.status(200).json({ success: true, message: 'Message reçu avec succès.' })
    } catch (error) {
      return res.status(500).json({ error: 'Erreur serveur lors de la réception du message.' })
    }
  }

  res.setHeader('Allow', ['POST'])
  return res.status(405).end(`Méthode ${req.method} non autorisée`)
}
