// src/lib/ai-tools.js
// ✅ Outils IA avec fallback offline si API absente, limite de tokens et DX simple

import OpenAI from 'openai'

const hasKey = !!process.env.OPENAI_API_KEY
const openai = hasKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

function offlineSummary(text, locale = 'fr') {
  const short = text.replace(/\s+/g, ' ').trim().slice(0, 180)
  return locale.startsWith('fr')
    ? `Résumé (offline) : ${short}${text.length > 180 ? '…' : ''}`
    : `Offline summary: ${short}${text.length > 180 ? '…' : ''}`
}

export async function generateProductSummary(text, locale = 'fr') {
  if (!hasKey) return offlineSummary(text, locale)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: `Résume ce texte produit en 3 phrases (${locale}). Style clair, vendeur.` },
      { role: 'user', content: text },
    ],
    temperature: 0.5,
    max_tokens: 220,
  })
  return completion.choices?.[0]?.message?.content ?? offlineSummary(text, locale)
}

export async function suggestProductIdeas(theme, locale = 'fr') {
  if (!hasKey) {
    return [
      `${theme} — bundle premium`,
      `${theme} — édition limitée`,
      `${theme} — version éco-responsable`,
    ].join('\n')
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: `Génère 10 idées de produits e-commerce (${locale}). Format: liste markdown.` },
      { role: 'user', content: theme },
    ],
    temperature: 0.8,
    max_tokens: 380,
  })
  return completion.choices?.[0]?.message?.content ?? ''
}
