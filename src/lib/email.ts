// src/lib/email.ts
// ✅ Transport SMTP robuste (pool, TLS, DKIM optionnel, idempotency),
// fallback env, headers (List-Unsubscribe), et helpers prêts pour tes templates.

import nodemailer from 'nodemailer';

import { renderTemplate, type RenderedEmail } from './emailTemplates';

const SMTP_URL = process.env.SMTP_URL; // ex: smtp://user:pass@smtp.mailgun.org:587
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_EMAIL || process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  (SMTP_USER ? `TechPlay <${SMTP_USER}>` : 'TechPlay <no-reply@techplay.example.com>');
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@techplay.example.com';

const DKIM_DOMAIN = process.env.DKIM_DOMAIN;
const DKIM_SELECTOR = process.env.DKIM_SELECTOR;
const DKIM_PRIVATE_KEY = process.env.DKIM_PRIVATE_KEY;

type AppTransport = ReturnType<typeof nodemailer.createTransport>;

let transporterPromise: Promise<AppTransport> | null = null;

function getDkimConfig() {
  if (!DKIM_DOMAIN || !DKIM_SELECTOR || !DKIM_PRIVATE_KEY) return undefined;

  return {
    domainName: DKIM_DOMAIN,
    keySelector: DKIM_SELECTOR,
    privateKey: DKIM_PRIVATE_KEY,
  };
}

function buildTransportOptions() {
  const common = {
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    tls: { rejectUnauthorized: true },
    ...(getDkimConfig() ? { dkim: getDkimConfig() } : {}),
  };

  if (SMTP_URL) {
    return {
      ...common,
      url: SMTP_URL,
    };
  }

  return {
    ...common,
    host: SMTP_HOST || 'smtp.gmail.com',
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    ...(SMTP_USER && SMTP_PASS
      ? {
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
          },
        }
      : {}),
  };
}

function createTransport(): AppTransport {
  return nodemailer.createTransport(buildTransportOptions());
}

async function getTransport(): Promise<AppTransport> {
  if (!transporterPromise) {
    const transport = createTransport();

    transporterPromise = transport
      .verify()
      .then(() => transport)
      .catch((error) => {
        transporterPromise = null;
        throw error;
      });
  }

  return transporterPromise;
}

function sanitizeMessageIdPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export type SendEmailOptions = {
  to: string;
  subject?: string;
  html?: string;
  text?: string;
  headers?: Record<string, string>;
  idempotencyKey?: string; // pour éviter les doublons (à toi de stocker si besoin)
  priority?: 'high' | 'normal' | 'low';
  listUnsubscribe?: string; // ex: <mailto:unsubscribe@techplay.com>, <https://...>
};

export async function sendEmailRaw({
  to,
  subject = '',
  html = '',
  text = '',
  headers,
  idempotencyKey,
  priority = 'normal',
  listUnsubscribe,
}: SendEmailOptions) {
  const transport = await getTransport();

  const messageId =
    headers?.['Message-ID'] ||
    (idempotencyKey
      ? `<${sanitizeMessageIdPart(idempotencyKey)}@techplay>`
      : undefined);

  const finalHeaders: Record<string, string> = {
    ...(idempotencyKey ? { 'X-Entity-Ref-ID': idempotencyKey } : {}),
    ...(listUnsubscribe ? { 'List-Unsubscribe': listUnsubscribe } : {}),
    ...(headers || {}),
  };

  return transport.sendMail({
    from: EMAIL_FROM,
    to,
    replyTo: REPLY_TO,
    subject,
    html,
    text,
    headers: finalHeaders,
    priority,
    ...(messageId ? { messageId } : {}),
  });
}

/** 🔁 Alias pour compat : les imports `sendEmail` continueront à fonctionner */
export { sendEmailRaw as sendEmail };

// Helpers pour tes templates
export async function sendTemplate<K extends Parameters<typeof renderTemplate>[0]>(
  templateKey: K,
  to: string,
  vars: Record<string, unknown> = {}
) {
  const rendered: RenderedEmail = renderTemplate(templateKey, { ...vars, to });

  // Unsubscribe header (les webmails l’affichent joliment)
  const unsubscribeUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `<${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '')}/unsubscribe>`
    : undefined;

  return sendEmailRaw({
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    ...(unsubscribeUrl ? { listUnsubscribe: unsubscribeUrl } : {}),
  });
}

// Exemples prêts à l’emploi
export async function sendOrderConfirmation(
  to: string,
  name: string,
  orderId?: string
) {
  return sendTemplate('confirmation', to, { name, orderId });
}

export async function sendAbandonedCart(to: string, product: string) {
  return sendTemplate('abandonPanier', to, { product });
}

export async function sendResetPassword(to: string, link: string) {
  return sendTemplate('resetPassword', to, { link });
}