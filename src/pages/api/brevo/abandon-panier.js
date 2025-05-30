// src/pages/api/brevo/abandon-panier.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, cart } = req.body

  try {
    const items = cart.map((item) => `- ${item.title} (${item.price}€ x ${item.quantity})`).join('\n')

    const htmlContent = `
      <h2>Votre panier vous attend !</h2>
      <p>Voici le contenu :</p>
      <pre>${items}</pre>
      <p><a href="https://techplay.fr/panier" style="color: #0070f3;">Finaliser mon achat</a></p>
    `

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'TechPlay', email: 'contact@techplay.fr' },
        to: [{ email }],
        subject: 'N’oubliez pas votre panier !',
        htmlContent,
      }),
    })

    if (!brevoRes.ok) {
      const error = await brevoRes.text()
      return res.status(500).json({ error })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erreur interne serveur' })
  }
}
