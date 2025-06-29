// Traduction : Google Translate API (avec fallback IA possible)
export async function translateToEnglish(text) {
  return await translate(text, 'en');
}

export async function translate(text, target = 'fr') {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) throw new Error('Clé API Google Translate manquante');

  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, target, format: 'text' }),
  });

  const data = await res.json();
  return data?.data?.translations?.[0]?.translatedText || text;
}
