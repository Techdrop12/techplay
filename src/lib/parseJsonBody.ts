/**
 * Helper pour parser le body JSON d'une Request et le valider avec Zod.
 * Évite la répétition try/catch + safeParse dans les routes API.
 */
import { NextResponse } from 'next/server'

import type { z } from 'zod'

export type ParseJsonBodyResult<T> =
  | { data: T; response?: never }
  | { data?: never; response: NextResponse }

const DEFAULT_JSON_ERROR = 'Body JSON invalide'
const DEFAULT_VALIDATION_ERROR = 'Validation échouée'

export async function parseJsonBody<T>(
  req: Request,
  schema: z.ZodType<T>,
  options?: {
    invalidJsonMessage?: string
    validationErrorMessage?: string
  }
): Promise<ParseJsonBodyResult<T>> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return {
      response: NextResponse.json(
        { error: options?.invalidJsonMessage ?? DEFAULT_JSON_ERROR },
        { status: 400 }
      ),
    }
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return {
      response: NextResponse.json(
        {
          error: options?.validationErrorMessage ?? DEFAULT_VALIDATION_ERROR,
          details: parsed.error.flatten(),
        },
        { status: 400 }
      ),
    }
  }

  return { data: parsed.data }
}
