import { NextResponse } from 'next/server'

const MAX_QUERY_LENGTH = 2000

export async function POST(req: Request) {
  const form = await req.formData()
  const rawUrl = String(form.get('url') ?? '').trim()
  const rawText = String(form.get('text') ?? '').trim()
  const rawTitle = String(form.get('title') ?? '').trim()
  const raw = rawUrl || rawText || rawTitle || ''
  const truncated =
    raw.length > MAX_QUERY_LENGTH ? raw.slice(0, MAX_QUERY_LENGTH) : raw
  const q = encodeURIComponent(truncated)
  const base = new URL(req.url).origin
  return NextResponse.redirect(new URL(`/products?q=${q}`, base))
}
