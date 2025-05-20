export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, cart, total } = req.body

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'TechPlay', email: 'no-reply@techplay.com' },
        to: [{ email }],
        subject: 'Confirmation de votre commande',
        htmlContent: `
          <h2>Merci pour votre commande !</h2>
          <ul>
            ${cart.map(i => `<li>${i.title} x${i.quantity}</li>`).join('')}
          </ul>
          <p><strong>Total : ${total} €</strong></p>
        `,
      }),
    })

    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Erreur envoi email' })
  }
}
