// src/lib/translate.ts
// @deprecated Non importé. À brancher si traduction automatique souhaitée.
// Google Translate v2 – batching, cache mémoire, gestion erreurs

const ENDPOINT = 'https://translation.googleapis.com/language/translate/v2';
const _cache = new Map<string, { value: string; expires: number }>();

function _cacheKey(text: string, target: string): string {
  return `${target}::${text}`;
}

export async function translate(text: string, target = 'fr'): Promise<string> {
  if (!text || typeof text !== 'string') return '';
  const key = _cacheKey(text, target);
  const hit = _cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) throw new Error('Clé API Google Translate manquante');

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: [text], target, format: 'text' }),
  });

  if (!res.ok) throw new Error(`Translate API error: ${res.status}`);
  const data = (await res.json()) as {
    data?: { translations?: Array<{ translatedText?: string }> };
  };
  const translated = data?.data?.translations?.[0]?.translatedText ?? text;

  _cache.set(key, { value: translated, expires: Date.now() + 1000 * 60 * 60 });
  return translated;
}

export async function translateToEnglish(text: string): Promise<string> {
  return translate(text, 'en');
}

export async function translateBatch(texts: string[], target = 'fr'): Promise<string[]> {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) throw new Error('Clé API Google Translate manquante');

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: texts, target, format: 'text' }),
  });
  if (!res.ok) throw new Error(`Translate API error: ${res.status}`);
  const data = (await res.json()) as {
    data?: { translations?: Array<{ translatedText?: string }> };
  };
  return data?.data?.translations?.map((t) => t.translatedText ?? '') ?? texts;
}
