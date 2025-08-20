// /src/lib/email/sendBrevo.js
// Envoi d'emails transactionnels via Brevo (Sendinblue).
// - Support texte + html, cc/bcc, pièces jointes, variables.
// - Comportement "no-op" en dev si BREVO_API_KEY absent (log console).

import SibApiV3Sdk from 'sib-api-v3-sdk'

/**
 * @typedef {{ content:string, name?:string, type?:string }} Attachment
 */

/**
 * @param {Object} params
 * @param {string|string[]} params.to - Destinataire(s)
 * @param {string} params.subject
 * @param {string} [params.html]
 * @param {string} [params.text]
 * @param {string|string[]} [params.cc]
 * @param {string|string[]} [params.bcc]
 * @param {Attachment[]} [params.attachments] - base64 `content`, `type` ex: 'application/pdf'
 * @param {object} [params.params] - variables de template si besoin
 */
export async function sendBrevoEmail ({
  to,
  subject,
  html,
  text,
  cc,
  bcc,
  attachments = [],
  params,
}) {
  const apiKey = process.env.BREVO_API_KEY
  const fromEmail = process.env.BREVO_SENDER || 'noreply@techplay.com'
  const fromName = process.env.BREVO_SENDER_NAME || 'TechPlay'

  // Mode dev sans clé : on log et on sort proprement.
  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[brevo] (dev no-op) →', { to, subject })
    } else {
      throw new Error('Brevo API Key missing')
    }
    return { mocked: true }
  }

  const client = SibApiV3Sdk.ApiClient.instance
  client.authentications['api-key'].apiKey = apiKey

  const api = new SibApiV3Sdk.TransactionalEmailsApi()

  const normalize = (list) =>
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
    attachment:
      attachments?.map((a) => ({
        content: a.content,
        name: a.name,
        type: a.type,
      })) || undefined,
  })

  return api.sendTransacEmail(email)
}

export default sendBrevoEmail
