// ✅ /src/pages/api/track-ab.js (tracking AB Test frontend)
import { logEvent } from '@/lib/logEvent';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { variant, event, productId, userId } = req.body;
    // Log l’événement AB test en base ou en log
    await logEvent({
      type: 'ab_test',
      variant,
      event,
      productId,
      userId,
      timestamp: new Date()
    });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
