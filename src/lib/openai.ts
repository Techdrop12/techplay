// src/lib/openai.ts — client OpenAI minimal + helper génération
import OpenAI from 'openai'


const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) console.warn('[openai] OPENAI_API_KEY manquante')


export const openai = new OpenAI({ apiKey })


export async function generateBlog(prompt: string, opts: { model?: string; temperature?: number; maxTokens?: number; system?: string } = {}) {
const model = opts.model || process.env.OPENAI_MODEL || 'gpt-4o-mini'
const system = opts.system || 'Tu es un rédacteur SEO concis, clair et utile.'


const res = await openai.chat.completions.create({
model,
temperature: opts.temperature ?? 0.7,
max_tokens: opts.maxTokens ?? 600,
messages: [
{ role: 'system', content: system },
{ role: 'user', content: prompt },
],
})


return res.choices?.[0]?.message?.content?.trim() || ''
}