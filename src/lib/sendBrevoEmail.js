// src/lib/sendBrevoEmail.js
// Client Brevo (ex-Sendinblue) robuste + gestion d’erreurs + dry-run
import SibApiV3Sdk from 'sib-api-v3-sdk'

/**
 * @typedef {{ email: string, name?: string }} EmailAddress
 * @typedef {{
 *   to: string | EmailAddress[]
 *   subject: string
 *   html: string
 *   text?: string
 *   replyTo?: string
 *   tags?: string[]
 *   cc?: string[] | EmailAddress[]
 *   bcc?: string[] | EmailAddress[]
 *   attachments?: Array<{ url?: string; name?: string; content?: string; type?: string }>
 * }} SendEmailInput
 */

/**
 * Construit un tableau de destinataires pour l'API Brevo.
 * @param {string | EmailAddress[]} raw
 * @returns {EmailAddress[]}
 */
function normalizeRecipients(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw
      .map((x) =>
        typeof x === 'string' ? { email: x } : { email: String(x.email || '').trim(), name: x.name }
      )
      .filter((r) => r.email)
  }
  return [{ email: String(raw).trim() }].filter((r) => r.email)
}

/**
 * Envoie un email via Brevo.
 * @param {SendEmailInput} input
 */
export async function sendBrevoEmail(input) {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER
  const senderName = process.env.BREVO_SENDER_NAME || 'TechPlay'
  const disableSend = process.env.BREVO_DISABLE_SEND === '1'

  if (!apiKey) throw new Error('BREVO_API_KEY manquante')
  if (!senderEmail) throw new Error('BREVO_SENDER manquante')
  if (!input?.to) throw new Error('Destinataire manquant')
  if (!input?.subject) throw new Error('Sujet manquant')
  if (!input?.html && !input?.text) throw new Error('Contenu HTML ou texte requis')

  const to = normalizeRecipients(input.to)
  if (to.length === 0) throw new Error('Aucun destinataire valide')

  const defaultClient = SibApiV3Sdk.ApiClient.instance
  defaultClient.authentications['api-key'].apiKey = apiKey

  const api = new SibApiV3Sdk.TransactionalEmailsApi()

  const ccArr = normalizeRecipients(input.cc || [])
  const bccArr = normalizeRecipients(input.bcc || [])

  // Mode dry-run pour dev / test: pas d’envoi, juste log
  if (disableSend) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[brevo] DRY RUN — NO SEND', {
        to,
        subject: input.subject,
        cc: ccArr,
        bcc: bccArr,
        tags: input.tags,
        hasHtml: !!input.html,
        hasText: !!input.text,
      })
    }
    return { dryRun: true }
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
    to,
    cc: ccArr.length ? ccArr : undefined,
    bcc: bccArr.length ? bccArr : undefined,
    sender: { email: senderEmail, name: senderName },
    subject: input.subject,
    htmlContent: input.html,
    textContent: input.text,
    replyTo: input.replyTo ? { email: input.replyTo } : undefined,
    tags: input.tags,
    attachment: input.attachments,
  })

  try {
    const res = await api.sendTransacEmail(sendSmtpEmail)
    return res?.messageId || res
  } catch (e) {
    // Mapping d’erreurs commun Brevo
    const code = e?.status || e?.code
    const details =
      e?.response?.text ||
      e?.response?.body?.message ||
      e?.response?.body ||
      e?.message ||
      e

    const errMsg = `[brevo] send failed${code ? ` (HTTP ${code})` : ''}: ${String(details)}`
    if (process.env.NODE_ENV !== 'production') {
      console.error(errMsg)
    }
    const err = new Error(errMsg)
    // @ts-ignore enrichissement
    err.status = code
    // @ts-ignore enrichissement
    err.details = details
    throw err
  }
}

export default sendBrevoEmail
