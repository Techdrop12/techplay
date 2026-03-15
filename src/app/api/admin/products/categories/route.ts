import { NextResponse } from 'next/server'

import { error as logError } from '@/lib/logger'
import { connectToDatabase } from '@/lib/db'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/requireAdmin'

export async function GET() {
  const err = await requireAdmin()
  if (err) return err

  try {
    await connectToDatabase()
    const categories = await Product.distinct('category').exec()
    const sorted = (categories as string[]).filter(Boolean).sort()
    return NextResponse.json(sorted)
  } catch (e) {
    logError('[admin/products/categories]', e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
