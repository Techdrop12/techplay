// src/lib/sendConfirmationEmail.js


/**
* @param {{ to: string, order: { _id?: string | number, total?: number, shippingMethod?: string } }} params
*/
export async function sendConfirmationEmail({ to, order }) {
const id = order?._id ?? ''
const total = Number(order?.total ?? 0).toFixed(2)
const shipping = order?.shippingMethod || 'Standard'


const subject = `Confirmation de votre commande TechPlay ${id ? `#${id}` : ''}`


const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${subject}</title>
<style>
body{margin:0;padding:0;background:#0b0b0c;color:#e6e6e6;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif}
.container{max-width:640px;margin:0 auto;padding:32px}
.card{background:#111214;border:1px solid #1f2124;border-radius:16px;padding:24px}
h1{margin:0 0 8px;font-size:22px}
p{margin:8px 0;line-height:1.45}
.muted{color:#9aa0a6}
.btn{display:inline-block;margin-top:16px;padding:10px 16px;border-radius:10px;border:1px solid #2a2e33;text-decoration:none;color:#e6e6e6}
</style>
</head>
<body>
<div class="container">
<div class="card">
<h1>Merci pour votre commande 👋</h1>
${id ? `<p class="muted">Commande <strong>#${id}</strong></p>` : ''}
<p>Total : <strong>${total} €</strong></p>
<p>Mode de livraison : <strong>${shipping}</strong></p>
<p class="muted">Vous recevrez un e‑mail dès l’expédition. Conservez cet e‑mail comme reçu.</p>
<a class="btn" href="${process.env.NEXT_PUBLIC_SITE_URL || '#'}">Retourner sur TechPlay</a>
</div>
<p class="muted" style="margin-top:16px">Si vous n’êtes pas à l’origine de cette commande, ignorez cet e‑mail.</p>
</div>
</body>
</html>`


const text = [
'Merci pour votre commande TechPlay',
id ? `Commande #${id}` : '',
`Total: ${total} €`,
`Livraison: ${shipping}`,
'',
`Suivi: ${process.env.NEXT_PUBLIC_SITE_URL || ''}`,
].filter(Boolean).join('\n')


await sendBrevoEmail({ to, subject, html, text, tags: ['order', 'confirmation'] })
}


export default sendConfirmationEmail