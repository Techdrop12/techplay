import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Traduit un contenu HTML ou texte brut en anglais.
 * Conserve la structure HTML si présente.
 * @param {string} content - Contenu à traduire
 * @returns {string} - Contenu traduit en anglais
 */
export async function translateToEnglish(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('⛔ Contenu invalide ou vide à traduire.')
  }

  const prompt = `
Tu es un traducteur professionnel. Traduis le contenu HTML suivant en anglais, en gardant les balises HTML intactes.
Ne modifie pas la structure HTML, traduis uniquement le texte.

Contenu :
${content}
`

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000
    })

    return res.choices[0].message.content.trim()
  } catch (error) {
    console.error('Erreur traduction OpenAI:', error)
    return '[Erreur de traduction]'
  }
}
