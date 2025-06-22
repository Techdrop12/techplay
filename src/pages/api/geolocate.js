// src/pages/api/geolocate.js

export default async function handler(req, res) {
  try {
    // Appel à l'API ipapi.co pour récupérer la localisation IP
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la géolocalisation');
    }
    const data = await response.json();

    // On renvoie uniquement les infos utiles (pays, région, ville)
    res.status(200).json({
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      countryCode: data.country,
      postal: data.postal,
      timezone: data.timezone
    });
  } catch (error) {
    console.error('API géolocalisation error:', error);
    res.status(500).json({ error: 'Impossible de récupérer la géolocalisation' });
  }
}
