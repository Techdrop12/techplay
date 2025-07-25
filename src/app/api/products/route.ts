import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Product from '@/models/Product'

export async function GET() {
  await connectToDatabase()

  const recommended = await Product.find({ recommended: true }).limit(4).lean()
  return NextResponse.json(recommended)
}
