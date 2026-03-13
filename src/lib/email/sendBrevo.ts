import SibApiV3Sdk from 'sib-api-v3-sdk'

import { log } from '@/lib/logger'

export interface BrevoAttachment {
  content: string
  name?: string
  type?: string
}

export interface SendBrevoParams {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: BrevoAttachment[]
  params?: Record<string, unknown>
  tags?: string[]
}

export async function sendBrevoEmail({
  to,
  subject,
  html,
  text,
  cc,
  bcc,
  attachments = [],
  params,
  tags,
}: SendBrevoParams): Promise<{ mocked?: boolean } | unknown> {
  const apiKey = process.env.BREVO_API_KEY
  const fromEmail = process.env.BREVO_SENDER ?? 'noreply@techplay.com'
  const fromName = process.env.BREVO_SENDER_NAME ?? 'TechPlay'

  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      log('[brevo] (dev no-op) →', { to, subject })
    } else {
      throw new Error('Brevo API Key missing')
    }
    return { mocked: true }
  }

  const client = SibApiV3Sdk.ApiClient.instance
  client.authentications['api-key'].apiKey = apiKey

  const api = new SibApiV3Sdk.TransactionalEmailsApi()

  const normalize = (list: string | string[] | undefined): { email: string }[] | undefined =>
    !list
      ? undefined
      : (Array.isArray(list) ? list : [list]).map((email) => ({ email }))

  const email = new SibApiV3Sdk.SendSmtpEmail({
    to: normalize(to),
    cc: normalize(cc),
    bcc: normalize(bcc),
    sender: { email: fromEmail, name: fromName },
    subject,
    htmlContent: html,
    textContent: text,
    params,
    tags,
    attachment:
      attachments?.map((a) => ({
        content: a.content,
        name: a.name,
        type: a.type,
      })) ?? undefined,
  })

  return api.sendTransacEmail(email)
}

export default sendBrevoEmail
