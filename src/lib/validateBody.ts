// src/lib/validateBody.ts
// Sanitizer/validator léger pour routes API (préférer Zod quand possible)

export interface ValidateBodyOptions {
  allowedKeys?: string[] | null;
  allowEmpty?: boolean;
}

export function validateBody<T extends Record<string, unknown>>(
  body: Record<string, unknown>,
  required: string[] = [],
  options: ValidateBodyOptions = {}
): T {
  if (!body || typeof body !== 'object') throw new Error('Invalid JSON body');
  const { allowedKeys = null, allowEmpty = false } = options;

  for (const key of required) {
    const value = body[key];
    if (
      value === undefined ||
      value === null ||
      (!allowEmpty && typeof value === 'string' && value.trim() === '')
    ) {
      throw new Error(`Missing required field: ${key}`);
    }
  }

  if (Array.isArray(allowedKeys)) {
    for (const k of Object.keys(body)) {
      if (!allowedKeys.includes(k)) delete body[k];
    }
  }

  for (const [k, v] of Object.entries(body)) {
    if (typeof v === 'string') {
      body[k] = v.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 10000);
    }
  }

  return body as T;
}

export default validateBody;
