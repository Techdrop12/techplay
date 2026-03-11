import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error

  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!token || token !== process.env.ADMIN_REVALIDATE_TOKEN) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const tag = url.searchParams.get('tag')
  const path = url.searchParams.get('path')

  if (!tag && !path) {
    return NextResponse.json(
      { ok: false, error: 'missing tag or path' },
      { status: 400 }
    )
  }

  try {
    if (tag) revalidateTag(tag, 'max')
    if (path) revalidatePath(path)

    return NextResponse.json({ ok: true, tag, path })
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) || 'error' },
      { status: 500 }
    )
  }
}