import SibApiV3Sdk from 'sib-api-v3-sdk'

export default async function sendConfirmationEmail({ toEmail, toName, orderId, amount }) {
  const apiKey = process.env.BREVO_API_KEY
  const client = SibApiV3Sdk.ApiClient.instance
  client.authentications['api-key'].apiKey = apiKey

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

  const sendSmtpEmail = {
    to: [{ email: toEmail, name: toName }],
    sender: { name: 'TechPlay', email: 'noreply@techplay.com' },
    subject: '🧾 Confirmation de commande',
    htmlContent: `
      <h1>Merci pour votre commande, ${toName} !</h1>
      <p>Votre commande <strong>#${orderId}</strong> a bien été enregistrée.</p>
      <p>Montant total : <strong>${amount.toFixed(2)} €</strong></p>
      <p>Nous vous enverrons un email dès l’expédition.</p>
    `
  }

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('✅ Email envoyé à', toEmail)
  } catch (err) {
    console.error('❌ Erreur envoi email:', err)
  }
}
