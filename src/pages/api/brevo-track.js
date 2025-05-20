export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, event, cart } = req.body

  try {
    const response = await fetch('https://api.brevo.com/v3/track/events', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        email,
        properties: {
          panier: cart || [],
          source: 'TechPlay',
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return res.status(response.status).json(error)
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erreur serveur Brevo' })
  }
}
