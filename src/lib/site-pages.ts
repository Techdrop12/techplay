import 'server-only'

import { connectToDatabase } from '@/lib/db'
import SitePage from '@/models/SitePage'

export async function getSitePage(slug: string): Promise<{ title: string; content: string } | null> {
  try {
    await connectToDatabase()
    const doc = await SitePage.findOne({ slug: slug.trim().toLowerCase() })
      .select('title content')
      .lean()
      .exec()
    if (!doc) return null
    return {
      title: doc.title ?? '',
      content: doc.content ?? '',
    }
  } catch {
    return null
  }
}
