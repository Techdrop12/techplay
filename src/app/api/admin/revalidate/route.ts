import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  if (!token || token !== process.env.ADMIN_REVALIDATE_TOKEN) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const tag = url.searchParams.get('tag') // ex: products
  const path = url.searchParams.get('path') // ex: /products

  try {
    if (tag) revalidateTag(tag)
    if (path) revalidatePath(path)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 })
  }
}
