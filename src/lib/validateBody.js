import { z } from 'zod'

export function validateBody(schema, req) {
  try {
    const parsed = schema.parse(req.body)
    return { success: true, data: parsed }
  } catch (err) {
    return { success: false, error: err.errors }
  }
}
