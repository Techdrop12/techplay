'use client';

import { useState } from 'react';

export default function Carousel({ images }) {
  const [current, setCurrent] = useState(0);
  const length = images.length;

  const next = () => setCurrent((prev) => (prev + 1) % length);
  const prev = () => setCurrent((prev) => (prev - 1 + length) % length);

  if (!Array.isArray(images) || length === 0) return null;

  return (
    <div className="relative w-full max-w-md mx-auto">
      <img
        src={images[current]}
        alt={`Image ${current + 1}`}
        className="w-full rounded-lg shadow"
      />
      <button
        onClick={prev}
        aria-label="Image précédente"
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
      >
        ‹
      </button>
      <button
        onClick={next}
        aria-label="Image suivante"
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
      >
        ›
      </button>
      <div className="flex justify-center space-x-2 mt-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Voir image ${i + 1}`}
            className={`w-3 h-3 rounded-full ${i === current ? 'bg-blue-600' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
}
