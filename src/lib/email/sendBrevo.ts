import { log } from '@/lib/logger';

export interface BrevoAttachment {
  content: string;
  name?: string;
  type?: string;
}

export interface SendBrevoParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: BrevoAttachment[];
  params?: Record<string, unknown>;
  tags?: string[];
}

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

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
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_SENDER ?? 'noreply@techplay.com';
  const fromName = process.env.BREVO_SENDER_NAME ?? 'TechPlay';

  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      log('[brevo] (dev no-op) →', { to, subject });
    } else {
      throw new Error('Brevo API Key missing');
    }
    return { mocked: true };
  }

  const normalize = (list: string | string[] | undefined) =>
    !list ? undefined : (Array.isArray(list) ? list : [list]).map((email) => ({ email }));

  const body: Record<string, unknown> = {
    sender: { email: fromEmail, name: fromName },
    to: normalize(to),
    subject,
    ...(html && { htmlContent: html }),
    ...(text && { textContent: text }),
    ...(cc && { cc: normalize(cc) }),
    ...(bcc && { bcc: normalize(bcc) }),
    ...(params && { params }),
    ...(tags?.length && { tags }),
    ...(attachments.length && {
      attachment: attachments.map((a) => ({
        content: a.content,
        name: a.name,
        type: a.type,
      })),
    }),
  };

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${error}`);
  }

  return res.json();
}

export default sendBrevoEmail;
