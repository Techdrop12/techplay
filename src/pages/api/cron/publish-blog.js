// ✅ /src/pages/api/cron/publish-blog.js
import dbConnect from '@/lib/dbConnect'
import Blog from '@/models/Blog'

export default async function handler(req, res) {
  // Optionnel : protège contre appel direct non CRON
  if (req.headers['x-vercel-cron'] !== 'true') {
    return res.status(403).json({ message: 'Accès interdit' })
  }

  await dbConnect()
  const now = new Date()

  try {
    const result = await Blog.updateMany(
      {
        published: false,
        publishAt: { $lte: now }
      },
      {
        $set: { published: true, updatedAt: now }
      }
    )

    res.status(200).json({ success: true, modified: result.modifiedCount })
  } catch (error) {
    console.error('Erreur CRON publish:', error)
    res.status(500).json({ success: false, message: 'Erreur serveur' })
  }
}
