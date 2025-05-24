// lib/email/sendBrevo.ts
import axios from 'axios';

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export const sendBrevoEmail = async ({
  to,
  subject,
  htmlContent,
}: {
  to: string;
  subject: string;
  htmlContent: string;
}) => {
  try {
    const res = await axios.post(
      BREVO_API_URL,
      {
        sender: { name: 'TechPlay', email: 'noreply@techplay.com' },
        to: [{ email: to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data;
  } catch (err: any) {
    console.error('Brevo Error:', err.response?.data || err.message);
    throw new Error('Brevo send failed');
  }
};
