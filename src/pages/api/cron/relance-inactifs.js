import { sendBrevoEmail } from '@/lib/email/sendBrevo'
import { getInactiveUsers } from '@/lib/db/users'

export default async function handler(req, res) {
  // Protection simple : clé secrète
  if (req.query.secret !== process.env.RELANCE_SECRET) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  const users = await getInactiveUsers(30) // Inactifs depuis 30 jours

  for (const user of users) {
    const subject = `On ne vous a pas vu depuis un moment... 😢`
    const htmlContent = `
      <h2>Nous avons de nouveaux produits pour vous !</h2>
      <p>Profitez de -10% avec le code <strong>COME10</strong> valable 48h.</p>
      <p><a href="https://techplay.com">Revenir sur la boutique</a></p>
    `
    await sendBrevoEmail({
      to: user.email,
      subject,
      htmlContent,
    })
  }

  res.status(200).json({ relancesEnvoyees: users.length })
}
