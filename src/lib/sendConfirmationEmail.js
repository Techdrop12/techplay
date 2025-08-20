// src/lib/sendConfirmationEmail.js

import sendBrevoEmail from '@/lib/sendBrevoEmail.js'

/**
 * Types JSDoc (utilisés par TS pour typer ce module JS)
 * ----------------------------------------------------
 * @typedef {{ title?: string, quantity?: number, price?: number, total?: number }} OrderItem
 * @typedef {{
 *   _id?: string|number,
 *   id?: string|number,
 *   stripeSessionId?: string,
 *   total?: number,          // € si fourni
 *   amount?: number,         // € si fourni (alias de total)
 *   currency?: string,       // ex: "EUR"
 *   shippingMethod?: string, // ex: "Standard"
 *   items?: OrderItem[],
 *   shippingAddress?: string,
 *   billingAddress?: string
 * }} OrderShape
 *
 * @param {{ to: string, order: OrderShape }} params
 * @returns {Promise<void>}
 */

/**
 * Envoie un email de confirmation de commande.
 * - Accepte des payloads "anciens" ({ _id, total, shippingMethod })
 *   et "nouveaux" (stripeSessionId, amount, currency, items...).
 */
export async function sendConfirmationEmail({ to, order }) {
  if (!to) throw new Error('Recipient email (to) is required')

  // -------- Normalisation des données --------
  const id =
    order?._id ??
    order?.id ??
    order?.stripeSessionId ??
    ''

  // total/amount en € (le webhook t’envoie déjà des euros)
  const totalNum = Number(
    order?.total ??
    order?.amount ??
    0
  )

  const currency = String(order?.currency || 'EUR').toUpperCase()
  const shipping = order?.shippingMethod || 'Standard'
  const items = Array.isArray(order?.items) ? order.items : []

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com').replace(/\/+$/, '')

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(Number.isFinite(n) ? n : 0)

  const shortId = typeof id === 'string' && id.length > 10 ? `#${id.slice(0, 10)}…` : (id ? `#${id}` : '')

  const subject = `Confirmation de votre commande TechPlay ${shortId}`

  // -------- Tableau des items (si fournis) --------
  const itemsRowsHtml = items
    .map((it) => {
      const q = it.quantity ?? 1
      const p = Number(it.price ?? 0)
      const t = Number(it.total ?? p * q)
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #1f2124">${escapeHtml(it.title || 'Article')}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #1f2124;text-align:center">${q}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #1f2124;text-align:right">${fmtMoney(p)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #1f2124;text-align:right">${fmtMoney(t)}</td>
        </tr>`
    })
    .join('')

  const itemsText = items
    .map((it) => {
      const q = it.quantity ?? 1
      const p = Number(it.price ?? 0)
      const t = Number(it.total ?? p * q)
      return `- ${it.title || 'Article'} x${q} — ${fmtMoney(t)}`
    })
    .join('\n')

  // -------- HTML email (dark, propre, responsive) --------
  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(subject)}</title>
<style>
  body{margin:0;padding:0;background:#0b0b0c;color:#e6e6e6;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif}
  .container{max-width:680px;margin:0 auto;padding:32px}
  .card{background:#111214;border:1px solid #1f2124;border-radius:16px;padding:24px}
  h1{margin:0 0 8px;font-size:22px}
  p{margin:8px 0;line-height:1.5}
  .muted{color:#9aa0a6}
  .btn{display:inline-block;margin-top:16px;padding:10px 16px;border-radius:10px;border:1px solid #2a2e33;text-decoration:none;color:#e6e6e6}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .k{color:#9aa0a6}
  table{width:100%;border-collapse:collapse;border-spacing:0;margin-top:12px}
  th{font-size:12px;color:#9aa0a6;text-align:left;font-weight:600;padding:8px 12px;border-bottom:1px solid #1f2124}
  td{font-size:14px}
  .total{font-size:18px;font-weight:800}
</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>Merci pour votre commande 👋</h1>
      ${id ? `<p class="muted">Commande <strong>${escapeHtml(shortId)}</strong></p>` : ''}

      ${
        items.length
          ? `
        <table role="presentation" aria-label="Détail de votre commande">
          <thead>
            <tr>
              <th>Article</th>
              <th style="text-align:center">Qté</th>
              <th style="text-align:right">Prix</th>
              <th style="text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>${itemsRowsHtml}</tbody>
        </table>`
          : ''
      }

      <p class="total" style="margin-top:12px">Total : <strong>${fmtMoney(totalNum)}</strong></p>
      <p class="muted">Mode de livraison : <strong>${escapeHtml(shipping)}</strong></p>

      ${
        order?.shippingAddress || order?.billingAddress
          ? `<div class="grid" style="margin-top:12px">
              ${
                order.shippingAddress
                  ? `<div><p class="k">Livraison</p><p>${nl2br(escapeHtml(order.shippingAddress))}</p></div>`
                  : ''
              }
              ${
                order.billingAddress
                  ? `<div><p class="k">Facturation</p><p>${nl2br(escapeHtml(order.billingAddress))}</p></div>`
                  : ''
              }
            </div>`
          : ''
      }

      <p class="muted" style="margin-top:12px">
        Vous recevrez un e-mail dès l’expédition. Conservez cet e-mail comme reçu.
      </p>
      <a class="btn" href="${siteUrl}">Retourner sur TechPlay</a>
    </div>
    <p class="muted" style="margin-top:16px">
      Si vous n’êtes pas à l’origine de cette commande, ignorez cet e-mail.
    </p>
  </div>
</body>
</html>`

  // -------- Version texte --------
  const textLines = [
    'Merci pour votre commande TechPlay',
    id ? `Commande ${shortId}` : '',
    itemsText ? '\nDétails :\n' + itemsText : '',
    `\nTotal: ${fmtMoney(totalNum)}`,
    `Livraison: ${shipping}`,
    '',
    `Suivi: ${siteUrl}`,
  ].filter(Boolean)
  const text = textLines.join('\n')

  // -------- Envoi --------
  if (typeof sendBrevoEmail !== 'function') {
    // Fallback silencieux si l’impl import change ou est absent
    console.warn('[sendConfirmationEmail] sendBrevoEmail indisponible — log only')
    console.log({ to, subject, text })
    return
  }

  await sendBrevoEmail({
    to,
    subject,
    html,
    text,
    tags: ['order', 'confirmation'],
  })
}

// Petite sécurité XSS sur les contenus dynamiques
function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function nl2br(s) {
  return String(s).replace(/\n/g, '<br>')
}

export default sendConfirmationEmail
