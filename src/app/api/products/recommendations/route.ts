import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const recommended = await db.product.findMany({
    where: { featured: true },
    take: 4,
  })

  return NextResponse.json(recommended)
}
