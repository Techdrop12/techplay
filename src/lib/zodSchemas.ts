// src/lib/zodSchemas.ts
import { z, type ZodTypeAny } from 'zod'

/** Schémas réutilisables */
export const emailSchema = z
  .string()
  .trim()
  .email({ message: 'Adresse e-mail invalide' })
  .transform((v) => v.toLowerCase())

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Nom trop court')
  .max(80, 'Nom trop long')
  .regex(/^[\p{L}\p{M}' -]+$/u, { message: 'Caractères non autorisés dans le nom' })

export const addressSchema = z
  .string()
  .trim()
  .min(5, 'Adresse trop courte')
  .max(200, 'Adresse trop longue')

export const messageSchema = z
  .string()
  .trim()
  .min(10, 'Message trop court')
  .max(1000, 'Message trop long (1000 car. max)')
  .refine((v: string) => !/(https?:\/\/|www\.)/i.test(v), {
    message: 'Merci de ne pas inclure de lien dans le message',
  })

export const phoneSchema = z
  .string()
  .trim()
  .optional()
  .refine((v?: string) => !v || /^\+?[0-9\s().-]{7,20}$/.test(v), {
    message: 'Téléphone invalide',
  })

/** Contact */
export const contactSchema = z.object({
  email: emailSchema,
  message: messageSchema,
  name: nameSchema.optional(),
  consent: z.boolean().optional().default(false),
})
export type ContactInput = z.infer<typeof contactSchema>

/** Checkout (rétro-compatible : name/email/address restent des string) */
export const checkoutSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  phone: phoneSchema,
  postalCode: z
    .string()
    .trim()
    .optional()
    .refine((v?: string) => !v || /^[0-9A-Za-z -]{3,12}$/.test(v), {
      message: 'Code postal invalide',
    }),
  city: z.string().trim().optional(),
  country: z.string().trim().optional().default('FR'),
  agreeToTerms: z.boolean().optional().default(false),
})
export type CheckoutInput = z.infer<typeof checkoutSchema>

/** Helper parse + message d’erreur clair */
export function safeParseOrThrow<T extends ZodTypeAny>(schema: T, data: unknown) {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    throw new Error(first?.message ?? 'Données invalides')
  }
  return parsed.data as z.infer<T>
}
