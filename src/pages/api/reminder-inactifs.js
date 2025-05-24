import dbConnect from '@/lib/dbConnect'
import Order from '@/models/Order'
import sendBrevoEmail from '@/lib/sendBrevoEmail'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  await dbConnect()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Récupère les clients ayant passé 1 seule commande il y a > 7 jours
  const all = await Order.aggregate([
    { $match: { createdAt: { $lte: sevenDaysAgo } } },
    {
      $group: {
        _id: '$email',
        count: { $sum: 1 },
        lastDate: { $max: '$createdAt' }
      }
    },
    { $match: { count: 1 } }
  ])

  let sent = 0

  for (const user of all) {
    try {
      await sendBrevoEmail({
        to: user._id,
        subject: 'On vous a manqué ? 💌',
        html: `<p>Ça fait 7 jours ! On vous a préparé une petite surprise 😍</p>`
      })
      sent++
    } catch (err) {
      console.error('Erreur envoi à', user._id)
    }
  }

  res.status(200).json({ success: true, total: all.length, sent })
}
