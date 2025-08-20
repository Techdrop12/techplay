// src/lib/sendBrevoEmail.js
// Envoi Brevo (ex-Sendinblue) via API HTTP — aucun SDK requis

/**
 * @typedef {{ email: string, name?: string }} EmailAddress
 * @typedef {Object} SendEmailInput
 * @property {string | EmailAddress[]} to
 * @property {string} subject
 * @property {string} [html]
 * @property {string} [text]
 * @property {string} [replyTo]
 * @property {string[]} [tags]
 * @property {string[]|EmailAddress[]} [cc]
 * @property {string[]|EmailAddress[]} [bcc]
 * @property {Array<{ url?: string, name?: string, content?: string, type?: string }>} [attachments]
 */

/** Normalise une liste de destinataires vers le format Brevo */
function normalizeRecipients(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((x) =>
        typeof x === 'string'
          ? { email: x.trim() }
          : { email: String(x.email || '').trim(), name: x.name }
      )
      .filter((r) => r.email);
  }
  return [{ email: String(raw).trim() }].filter((r) => r.email);
}

/**
 * Envoie un email via Brevo.
 * @param {SendEmailInput} input
 */
export async function sendBrevoEmail(input) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER;
  const senderName = process.env.BREVO_SENDER_NAME || 'TechPlay';
  const disableSend = process.env.BREVO_DISABLE_SEND === '1';

  if (!apiKey) throw new Error('BREVO_API_KEY manquante');
  if (!senderEmail) throw new Error('BREVO_SENDER manquante');
  if (!input?.to) throw new Error('Destinataire manquant');
  if (!input?.subject) throw new Error('Sujet manquant');
  if (!input?.html && !input?.text) throw new Error('Contenu HTML ou texte requis');

  const to = normalizeRecipients(input.to);
  if (to.length === 0) throw new Error('Aucun destinataire valide');

  const cc = normalizeRecipients(input.cc || []);
  const bcc = normalizeRecipients(input.bcc || []);

  // Payload Brevo
  const payload = {
    sender: { email: senderEmail, name: senderName },
    to,
    subject: input.subject,
    htmlContent: input.html,
    textContent: input.text,
    replyTo: input.replyTo ? { email: input.replyTo } : undefined,
    tags: input.tags,
    // Nom de propriété exact attendu par Brevo: "attachment"
    attachment: input.attachments,
    ...(cc.length ? { cc } : {}),
    ...(bcc.length ? { bcc } : {}),
  };

  // Mode dry-run (utile en dev/préprod)
  if (disableSend) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[brevo] DRY RUN — NO SEND', {
        to,
        subject: input.subject,
        cc,
        bcc,
        tags: input.tags,
        hasHtml: !!input.html,
        hasText: !!input.text,
      });
    }
    return { dryRun: true };
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  // Essayons de lire la réponse (qu’elle soit 2xx ou non)
  let data = null;
  try {
    data = await res.json();
  } catch {
    // pas grave, on traitera avec le statut HTTP
  }

  if (!res.ok) {
    const code = res.status;
    const msg =
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.message ||
      `HTTP ${code}`;
    const err = new Error(`[brevo] send failed (HTTP ${code}): ${String(msg)}`);
    // @ts-ignore enrichissement
    err.status = code;
    // @ts-ignore enrichissement
    err.details = data;
    if (process.env.NODE_ENV !== 'production') console.error(err);
    throw err;
  }

  // Succès: Brevo renvoie { messageId: "...", messageIds: [...] }
  return data?.messageId || data;
}

export default sendBrevoEmail;
