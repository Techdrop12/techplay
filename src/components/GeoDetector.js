'use client';

import { useEffect, useState } from 'react';

export default function GeoDetector() {
  const [country, setCountry] = useState(null);

  useEffect(() => {
    fetch('/api/geolocate')
      .then(res => res.json())
      .then(data => setCountry(data.country))
      .catch(() => setCountry('unknown'));
  }, []);

  return (
    <div>
      <p>Vous êtes localisé en : {country || '...'}</p>
    </div>
  );
}
