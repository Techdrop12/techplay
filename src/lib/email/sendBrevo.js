// ✅ src/lib/email/sendBrevo.js

import axios from 'axios';

export default async function sendBrevo({ to, templateId, params }) {
  return axios.post('https://api.brevo.com/v3/smtp/email', {
    to,
    templateId,
    params,
  }, {
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    }
  });
}
