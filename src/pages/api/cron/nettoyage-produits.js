import { cleanInactiveProducts } from '@/lib/cron/cleanInactiveProducts'

export default async function handler(req, res) {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const deleted = await cleanInactiveProducts()
  res.status(200).json({ deleted })
}