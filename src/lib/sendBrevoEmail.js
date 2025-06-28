// ✅ /src/lib/sendBrevoEmail.js (email transactionnel, Brevo)
import SibApiV3Sdk from 'sib-api-v3-sdk';

export async function sendBrevoEmail({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('Brevo API Key missing');
  SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = apiKey;
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
    to: [{ email: to }],
    sender: { email: process.env.BREVO_SENDER, name: 'TechPlay' },
    subject,
    htmlContent: html,
  });

  return await apiInstance.sendTransacEmail(sendSmtpEmail);
}
