// ✅ /src/pages/api/geolocate.js (détection pays pour UX, bonus analytics)
export default async function handler(req, res) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // Utiliser une API externe gratuite pour géoloc si besoin
    // Ici renvoie juste l’IP pour la démo
    res.status(200).json({ ip });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
