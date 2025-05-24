import axios from 'axios'

export async function sendBrevoEmail({ to, subject, html }) {
  const key = process.env.BREVO_API_KEY

  if (!key) throw new Error('Clé API Brevo manquante')

  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: { name: 'TechPlay', email: 'no-reply@techplay.com' },
      to: [{ email: to }],
      subject,
      htmlContent: html
    },
    {
      headers: {
        'api-key': key,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }
    }
  )
}
