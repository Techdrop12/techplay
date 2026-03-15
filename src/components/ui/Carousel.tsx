'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface CarouselProps {
  images: string[];
}

export default function Carousel({ images }: CarouselProps) {
  const t = useTranslations('common');
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
        aria-label={t('carousel_prev_aria')}
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-[hsl(var(--text)/0.5)] text-[hsl(var(--accent-fg))] rounded-full p-1 hover:opacity-80"
      >
        ‹
      </button>
      <button
        onClick={next}
        aria-label={t('carousel_next_aria')}
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-[hsl(var(--text)/0.5)] text-[hsl(var(--accent-fg))] rounded-full p-1 hover:opacity-80"
      >
        ›
      </button>
      <div className="flex justify-center space-x-2 mt-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={t('view_image_aria', { index: i + 1 })}
            className={`w-3 h-3 rounded-full ${i === current ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--surface-2))]'}`}
          />
        ))}
      </div>
    </div>
  );
}
