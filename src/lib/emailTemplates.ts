// src/lib/emailTemplates.ts
// Système d’e-mails HTML + texte : layout responsive, préheader, dark mode,
// escape variables, pixel de tracking optionnel, et version texte automatique.

import { BRAND } from './constants'

type TemplateVars = Record<string, string | number | undefined>

export type RenderedEmail = {
  subject: string
  html: string
  text: string
}

export type TemplateFn = (vars: TemplateVars) => RenderedEmail

const SITE_NAME = BRAND.NAME
const SITE_URL = BRAND.URL
const SUPPORT_EMAIL = BRAND.SUPPORT_EMAIL
const LOGO_URL = process.env.NEXT_PUBLIC_EMAIL_LOGO_URL ?? `${SITE_URL}/logo-email.png`
const ADDRESS = BRAND.ADDRESS
const TRACKING_PIXEL_URL = process.env.NEXT_PUBLIC_EMAIL_PIXEL_URL

function escapeHtml(input: unknown): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function preheader(text: string) {
  return `<div style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;max-height:0;max-width:0;overflow:hidden;mso-hide:all;">${escapeHtml(
    text
  )}</div>`
}

function baseLayout(opts: {
  subject: string
  preheaderText?: string
  contentHtml: string
  utm?: string
  extraFooter?: string
  to?: string
}) {
  const utm = opts.utm ? (opts.utm.startsWith('?') ? opts.utm : `?${opts.utm}`) : ''
  const pixel =
    TRACKING_PIXEL_URL && opts.to
      ? `<img src="${TRACKING_PIXEL_URL}?to=${encodeURIComponent(opts.to)}&subject=${encodeURIComponent(
          opts.subject
        )}" width="1" height="1" alt="" style="display:block;border:0;outline:none;"/>`
      : ''

  const css = `
  body,table,td,a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100% }
  table,td { mso-table-lspace:0pt; mso-table-rspace:0pt }
  img { -ms-interpolation-mode:bicubic }
  img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none }
  table { border-collapse:collapse !important }
  body { margin:0 !important; padding:0 !important; width:100% !important; background:#0b0c10 }
  @media (prefers-color-scheme: light) { body { background:#f6f7fb } }
  .container { max-width:640px; margin:0 auto; background:#101218; color:#e8e8ea; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,'Helvetica Neue',Arial,'Noto Sans',sans-serif; }
  @media (prefers-color-scheme: light) { .container { background:#ffffff; color:#111827 } }
  .btn { display:inline-block; padding:12px 18px; border-radius:10px; text-decoration:none; font-weight:600 }
  .btn-primary { background:#3b82f6; color:#fff }
  .muted { color:#9aa0a6; font-size:12px; }
  .hr { height:1px; background:#20242b; margin:24px 0 }
  @media (prefers-color-scheme: light) { .hr { background:#e5e7eb } }
  `

  const html = `
  <!doctype html>
  <html lang="fr">
    <head>
      <meta charSet="utf-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <meta name="x-apple-disable-message-reformatting"/>
      <title>${escapeHtml(opts.subject)}</title>
      <style>${css}</style>
    </head>
    <body>
      ${opts.preheaderText ? preheader(opts.preheaderText) : ''}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table role="presentation" class="container" width="100%" cellspacing="0" cellpadding="0" style="padding:28px">
              <tr>
                <td style="text-align:center;padding-bottom:18px">
                  <a href="${SITE_URL}${utm}" style="text-decoration:none">
                    <img src="${LOGO_URL}" alt="${escapeHtml(SITE_NAME)}" width="56" height="56" style="border-radius:12px;"/>
                  </a>
                  <div style="font-size:14px;margin-top:8px">${escapeHtml(SITE_NAME)}</div>
                </td>
              </tr>
              <tr><td class="hr"></td></tr>
              <tr>
                <td style="font-size:16px;line-height:1.6">
                  ${opts.contentHtml}
                </td>
              </tr>
              <tr><td class="hr"></td></tr>
              <tr>
                <td class="muted" style="text-align:center">
                  ${opts.extraFooter ?? ''}
                  <div style="margin-top:8px">${escapeHtml(ADDRESS)}</div>
                  <div>Besoin d’aide ? <a href="mailto:${SUPPORT_EMAIL}" style="color:inherit">${SUPPORT_EMAIL}</a></div>
                  <div style="margin-top:8px">
                    <a href="${SITE_URL}/preferences" style="color:inherit">Gérer mes préférences</a>
                    • <a href="${SITE_URL}/unsubscribe" style="color:inherit">Se désabonner</a>
                  </div>
                  <div style="margin-top:8px">&copy; ${new Date().getFullYear()} ${escapeHtml(SITE_NAME)} — Tous droits réservés.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      ${pixel}
    </body>
  </html>
  `

  const textFooter = [
    ADDRESS,
    `Support: ${SUPPORT_EMAIL}`,
    `Préférences: ${SITE_URL}/preferences`,
    `Désabonnement: ${SITE_URL}/unsubscribe`,
  ].join('\n')

  return {
    html,
    textFooter,
  }
}

function asText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const confirmation: TemplateFn = (vars) => {
  const name = escapeHtml(vars.name ?? 'client')
  const orderId = escapeHtml(vars.orderId ?? '')
  const subject = `Merci pour votre commande, ${name} !`

  const { html, textFooter } = baseLayout({
    subject,
    preheaderText: 'Nous préparons votre colis avec soin.',
    utm: 'utm_source=email&utm_medium=transactionnel&utm_campaign=confirmation',
    to: typeof vars.to === 'string' ? vars.to : undefined,
    contentHtml: `
      <h1 style="margin:0 0 8px 0;font-size:24px;line-height:1.2">Merci pour votre commande, ${name} 👋</h1>
      <p>Nous préparons votre colis avec soin. Vous recevrez un e-mail dès son expédition.</p>
      ${
        orderId
          ? `<p style="margin:14px 0">Numéro de commande : <strong>${orderId}</strong></p>`
          : ''
      }
      <p style="margin:20px 0">
        <a class="btn btn-primary" href="${SITE_URL}/account/orders" target="_blank" rel="noreferrer">Suivre ma commande</a>
      </p>
      <p>Besoin d’aide ? Répondez simplement à cet e-mail — notre équipe est là pour vous 💙</p>
    `,
  })

  const text =
    `Merci pour votre commande, ${name}\n` +
    (orderId ? `Numéro de commande : ${orderId}\n` : '') +
    `Suivre ma commande : ${SITE_URL}/account/orders\n\n` +
    textFooter

  return { subject, html, text }
}

const abandonPanier: TemplateFn = (vars) => {
  const product = escapeHtml(vars.product ?? 'votre article')
  const subject = `Votre ${product} vous attend encore 🛒`

  const { html, textFooter } = baseLayout({
    subject,
    preheaderText: 'Vous avez laissé un article dans votre panier.',
    utm: 'utm_source=email&utm_medium=transactionnel&utm_campaign=abandon-panier',
    to: typeof vars.to === 'string' ? vars.to : undefined,
    contentHtml: `
      <h1 style="margin:0 0 8px 0;font-size:24px;line-height:1.2">Vous avez laissé ${product} dans votre panier</h1>
      <p>Il vous attend toujours 😉 — finalisez votre commande avant qu’il ne soit en rupture.</p>
      <p style="margin:20px 0">
        <a class="btn btn-primary" href="${SITE_URL}/cart" target="_blank" rel="noreferrer">Finaliser ma commande</a>
      </p>
      <p class="muted">Astuce : la livraison est offerte au-delà d’un certain montant.</p>
    `,
  })

  const text =
    `Vous avez laissé ${product} dans votre panier.\n` +
    `Finaliser ma commande : ${SITE_URL}/cart\n\n` +
    textFooter

  return { subject, html, text }
}

const resetPassword: TemplateFn = (vars) => {
  const subject = 'Réinitialisez votre mot de passe'
  const link = escapeHtml(vars.link ?? `${SITE_URL}/reset`)

  const { html, textFooter } = baseLayout({
    subject,
    preheaderText: 'Un lien sécurisé pour changer votre mot de passe.',
    utm: 'utm_source=email&utm_medium=transactionnel&utm_campaign=reset-password',
    to: typeof vars.to === 'string' ? vars.to : undefined,
    contentHtml: `
      <h1 style="margin:0 0 8px 0;font-size:24px;line-height:1.2">Réinitialiser votre mot de passe</h1>
      <p>Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.</p>
      <p style="margin:20px 0">
        <a class="btn btn-primary" href="${link}" target="_blank" rel="noreferrer">Changer mon mot de passe</a>
      </p>
      <p class="muted">Ce lien expire automatiquement pour votre sécurité.</p>
    `,
  })

  const text = `Réinitialiser votre mot de passe\n${link}\n\n${textFooter}`
  return { subject, html, text }
}

export const templates = {
  confirmation,
  abandonPanier,
  resetPassword,
}

export function renderTemplate<K extends keyof typeof templates>(
  key: K,
  vars: TemplateVars
): RenderedEmail {
  const rendered = templates[key](vars)

  return {
    ...rendered,
    text: rendered.text?.trim() || asText(rendered.html),
  }
}