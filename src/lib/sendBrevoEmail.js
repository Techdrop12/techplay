import Brevo from '@getbrevo/brevo';

const apiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@techplay.com';
const siteName = 'TechPlay';

export default async function sendBrevoEmail({ to, subject, html }) {
  const client = new Brevo.TransactionalEmailsApi();
  client.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  return client.sendTransacEmail({
    to: Array.isArray(to) ? to : [{ email: to }],
    sender: { name: siteName, email: senderEmail },
    subject,
    htmlContent: html,
  });
}
