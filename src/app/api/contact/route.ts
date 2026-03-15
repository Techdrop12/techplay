import { error as logError } from '@/lib/logger'
import { connectToDatabase } from '@/lib/db'
import ContactSubmission from '@/models/ContactSubmission'
import { apiError, apiSuccess } from '@/lib/apiResponse'
import { contactSchema } from '@/lib/zodSchemas'

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError('Body JSON invalide', 400)
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors
    const message = first?.message?.[0] ?? first?.email?.[0] ?? first?.name?.[0] ?? 'Données invalides'
    return apiError(message, 400)
  }

  const { name, email, message, consent } = parsed.data

  try {
    await connectToDatabase()
    const doc = await ContactSubmission.create({
      name: name?.trim() || undefined,
      email: email.trim().toLowerCase(),
      message: message.trim(),
      consent: Boolean(consent),
    })
    return apiSuccess(toPlain({ ok: true, id: doc._id }) as Record<string, unknown>)
  } catch (e) {
    logError('[contact] POST', e)
    return apiError("Erreur lors de l'envoi. Réessayez plus tard.", 500, {
      details: e instanceof Error ? e.message : undefined,
    })
  }
}
