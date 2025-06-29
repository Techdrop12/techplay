// Génération d’images avec Unsplash (fallback Dall-E à ajouter si souhaité)
export async function fetchUnsplashImage(query, orientation = 'landscape') {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) throw new Error('Clé API Unsplash manquante');

  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=${orientation}&client_id=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur lors de la récupération Unsplash');
  
  const data = await res.json();
  return data?.urls?.regular;
}
