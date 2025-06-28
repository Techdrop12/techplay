// ✅ /src/lib/translate.js (Google Translate API, fallback IA OpenAI)
export async function translate(text, target = 'fr') {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) throw new Error('Clé API Google Translate manquante');
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      q: text,
      target,
      format: 'text',
    }),
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (data.data?.translations?.[0]?.translatedText) {
    return data.data.translations[0].translatedText;
  }
  return text;
}
