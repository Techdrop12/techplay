// ✅ /src/components/ProductGallery.js (galerie produit – slider images)
'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProductGallery({ images = [] }) {
  const [index, setIndex] = useState(0);
  if (!images.length) return null;

  return (
    <div className="w-full mb-4">
      <div className="relative w-full aspect-square mb-2">
        <Image
          src={images[index]}
          alt={`Produit photo ${index + 1}`}
          fill
          className="object-contain rounded-lg shadow"
        />
      </div>
      <div className="flex gap-2 justify-center mt-2">
        {images.map((img, i) => (
          <button
            key={img}
            onClick={() => setIndex(i)}
            className={`w-12 h-12 border rounded transition ${i === index ? 'ring-2 ring-blue-500' : ''}`}
          >
            <Image
              src={img}
              alt={`Miniature ${i + 1}`}
              width={48}
              height={48}
              className="object-contain rounded"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
