// ✅ /src/components/GeoDetector.js (détection pays client, bonus conversion)
'use client';

import { useEffect } from 'react';

export default function GeoDetector({ onDetect }) {
  useEffect(() => {
    fetch('/api/geolocate')
      .then(res => res.json())
      .then(loc => {
        if (loc && loc.country) onDetect(loc.country);
      });
  }, [onDetect]);
  return null;
}
