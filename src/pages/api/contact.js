import { rateLimit } from '@/lib/rateLimit'
import { z } from 'zod'
import { validateBody } from '@/lib/validateBody'
import sendBrevoEmail from '@/lib/sendBrevoEmail'

// 🌐 Anti-spam : max 10 requêtes par minute
const limiter = rateLimit({ limit: 10, interval: 60_000 })

const contactSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  message: z.string().min(5).max(500),
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // ⛔ Anti-abus IP
  if (!limiter(req, res)) return

  // ✅ Validation zod
  const result = validateBody(contactSchema, req)
  if (!result.success) {
    return res.status(400).json({ error: 'Champs invalides', details: result.error })
  }

  const { name, email, message } = result.data

  try {
    await sendBrevoEmail({
      to: 'support@techplay.com',
      subject: `Message de ${name}`,
      html: `
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Message :</strong><br/>${message}</p>
      `,
    })

    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Erreur Brevo contact:', err.message)
    res.status(500).json({ error: 'Erreur envoi email' })
  }
}
