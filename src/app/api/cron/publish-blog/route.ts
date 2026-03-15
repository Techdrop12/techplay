import { NextRequest } from 'next/server'

import { serverEnv } from '@/env.server'
import { log } from '@/lib/logger'
import { verifySecret } from '@/lib/secureCompare'
import { apiError, apiSuccess } from '@/lib/apiResponse'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? req.nextUrl.searchParams.get('secret')
  const expected = serverEnv.CRON_SECRET

  if (expected && !verifySecret(secret, expected)) {
    return apiError('Unauthorized', 401)
  }

  // À compléter : logique OpenAI + base de données
  log('Cron : publication automatique de blog (simulé)')
  return apiSuccess({ success: true, message: 'Article publié' })
}
