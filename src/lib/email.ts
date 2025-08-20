// src/lib/email.ts
// ✅ Transport SMTP robuste (pool, TLS, DKIM optionnel, idempotency), helpers templates.
// - Types corrigés (Transporter)
// - Import "server-only" pour éviter tout bundling côté client
// - Fallback text si seul HTML fourni
// - En-têtes conditionnels (pas de valeurs vides)
// - Export d’alias: sendEmail = sendEmailRaw pour compat

import 'server-only'
import nodemailer, { type Transporter } from 'nodemailer'
import { renderTemplate, type RenderedEmail } from './emailTemplates'

const SMTP_URL = process.env.SMTP_URL // ex: smtp://user:pass@smtp.mailgun.org:587
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_EMAIL || process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS

const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  (SMTP_USER ? `TechPlay <${SMTP_USER}>` : 'TechPlay <no-reply@techplay.example.com>')
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@techplay.example.com'

const DKIM_DOMAIN = process.env.DKIM_DOMAIN
const DKIM_SELECTOR = process.env.DKIM_SELECTOR
const DKIM_PRIVATE_KEY = process.env.DKIM_PRIVATE_KEY

let transporterPromise: Promise<Transporter> | null = null

function createTransport(): Transporter {
  // ✅ Si URL SMTP fournie, on l’utilise directement (meilleure compat nodemailer)
  if (SMTP_URL) {
    return nodemailer.createTransport(SMTP_URL)
  }

  return nodemailer.createTransport({
    pool: true,
    host: SMTP_HOST || 'smtp.gmail.com',
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    maxConnections: 5,
    maxMessages: 100,
    tls: { rejectUnauthorized: true },
    dkim:
      DKIM_DOMAIN && DKIM_SELECTOR && DKIM_PRIVATE_KEY
        ? {
            domainName: DKIM_DOMAIN,
            keySelector: DKIM_SELECTOR,
            privateKey: DKIM_PRIVATE_KEY,
          }
        : undefined,
  })
}

async function getTransport(): Promise<Transporter> {
  if (!transporterPromise) {
    const tr = createTransport()
    transporterPromise = tr.verify().then(() => tr)
  }
  return transporterPromise
}

export type SendEmailOptions = {
  to: string
  subject?: string
  html?: string
  text?: string
  headers?: Record<string, string>
  idempotencyKey?: string // pour éviter les doublons (à toi de stocker si besoin)
  priority?: 'high' | 'normal' | 'low'
  listUnsubscribe?: string // ex: <mailto:unsubscribe@techplay.com>, <https://...>
}

export async function sendEmailRaw({
  to,
  subject = '',
  html = '',
  text = '',
  headers,
  idempotencyKey,
  priority = 'normal',
  listUnsubscribe,
}: SendEmailOptions): Promise<void> {
  const transport = await getTransport()

  const messageId =
    headers?.['Message-ID'] || (idempotencyKey ? `<${idempotencyKey}@techplay>` : undefined)

  const finalHeaders: Record<string, string> = {
    ...(idempotencyKey ? { 'X-Entity-Ref-ID': String(idempotencyKey) } : {}),
    ...(listUnsubscribe ? { 'List-Unsubscribe': listUnsubscribe } : {}),
    ...(headers ?? {}),
  }

  // Fallback text basique si aucun "text" n'est fourni
  const plain =
    text ||
    (html
      ? html.replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
      : undefined)

  await transport.sendMail({
    from: EMAIL_FROM,
    to,
    replyTo: REPLY_TO,
    subject,
    html,
    text: plain,
    headers: finalHeaders,
    priority,
    messageId,
  })
}

// Helpers pour tes templates
export async function sendTemplate<K extends Parameters<typeof renderTemplate>[0]>(
  templateKey: K,
  to: string,
  vars: Record<string, any> = {}
) {
  const rendered: RenderedEmail = renderTemplate(templateKey, { ...vars, to })

  const unsubscribeUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `<${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe>`
    : undefined

  await sendEmailRaw({
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    listUnsubscribe: unsubscribeUrl,
  })
}

// Exemples prêts à l’emploi
export async function sendOrderConfirmation(to: string, name: string, orderId?: string) {
  return sendTemplate('confirmation', to, { name, orderId })
}
export async function sendAbandonedCart(to: string, product: string) {
  return sendTemplate('abandonPanier', to, { product })
}
export async function sendResetPassword(to: string, link: string) {
  return sendTemplate('resetPassword', to, { link })
}

// ✅ Compat: permet d'importer { sendEmail } partout
export const sendEmail = sendEmailRaw
