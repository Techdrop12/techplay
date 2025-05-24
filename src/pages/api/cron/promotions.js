import { applyScheduledPromos } from '@/lib/promos/scheduledPromos'

export default async function handler(req, res) {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const updated = await applyScheduledPromos()
  res.status(200).json({ promosApplied: updated })
}