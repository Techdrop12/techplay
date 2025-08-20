// src/lib/sendBrevoEmail.js
// Client Brevo (ex‑Sendinblue) avec options avancées + gestion d’erreurs
import SibApiV3Sdk from 'sib-api-v3-sdk'


/**
* @typedef {{
* to: string | { email: string; name?: string }[]
* subject: string
* html: string
* text?: string
* replyTo?: string
* tags?: string[]
* cc?: string[]
* bcc?: string[]
* attachments?: Array<{ url?: string; name?: string; content?: string; type?: string }>
* }} SendEmailInput
*/


/**
* @param {SendEmailInput} input
*/
export async function sendBrevoEmail(input) {
const apiKey = process.env.BREVO_API_KEY
const senderEmail = process.env.BREVO_SENDER
const senderName = process.env.BREVO_SENDER_NAME || 'TechPlay'


if (!apiKey) throw new Error('BREVO_API_KEY manquante')
if (!senderEmail) throw new Error('BREVO_SENDER manquante')
if (!input?.to) throw new Error('Destinataire manquant')


const defaultClient = SibApiV3Sdk.ApiClient.instance
defaultClient.authentications['api-key'].apiKey = apiKey


const api = new SibApiV3Sdk.TransactionalEmailsApi()


const to = Array.isArray(input.to)
? input.to
: [{ email: input.to }]


const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
to,
cc: input.cc?.map((email) => ({ email })),
bcc: input.bcc?.map((email) => ({ email })),
sender: { email: senderEmail, name: senderName },
subject: input.subject,
htmlContent: input.html,
textContent: input.text,
replyTo: input.replyTo ? { email: input.replyTo } : undefined,
tags: input.tags,
attachment: input.attachments,
})


const res = await api.sendTransacEmail(sendSmtpEmail)
return res?.messageId || res
}


export default sendBrevoEmail