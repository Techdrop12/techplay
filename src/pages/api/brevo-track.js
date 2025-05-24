import SibApiV3Sdk from 'sib-api-v3-sdk'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Email invalide' })

  const defaultClient = SibApiV3Sdk.ApiClient.instance
  const apiKey = defaultClient.authentications['api-key']
  apiKey.apiKey = process.env.BREVO_API_KEY

  const contactApi = new SibApiV3Sdk.ContactsApi()

  try {
    // Remplacer 123 par l'ID de ta liste contacts Brevo (ex: PanierAbandonne)
    await contactApi.createContact({
      email,
      listIds: [123],
      updateEnabled: true, // évite erreur si contact déjà existant
    })
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Erreur Brevo:', error.body || error)
    return res.status(500).json({ error: 'Erreur Brevo' })
  }
}
