import { getAnalyticsStats } from '@/lib/ga4'

export default async function handler(req, res) {
  try {
    const data = await getAnalyticsStats()
    res.status(200).json(data)
  } catch (error) {
    console.error('GA4 error:', error)
    res.status(500).json({ error: 'Erreur Google Analytics' })
  }
}
