// ✅ /src/lib/image-generator.js (bonus IA image Unsplash/Dall-E)
export async function getUnsplashImage(query, orientation = 'landscape') {
  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=${orientation}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur Unsplash');
  const data = await res.json();
  return data.urls?.regular;
}
