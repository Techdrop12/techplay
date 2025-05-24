import { sendBrevoEmail } from '@/lib/email/sendBrevo'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, name } = req.body

  const subject = 'Merci pour votre achat ! 🎉'
  const htmlContent = `
    <h2>Bonjour ${name},</h2>
    <p>Merci pour votre commande. Découvrez aussi nos produits similaires 👇</p>
    <p><a href="https://techplay.com">Voir nos nouveautés</a></p>
  `

  try {
    await sendBrevoEmail({ to: email, subject, htmlContent })
    res.status(200).json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to send post-purchase email' })
  }
}