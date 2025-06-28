'use client';

import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function ScoreStars({ value = 0, max = 5 }) {
  const rounded = Math.round(value * 2) / 2;

  return (
    <div
      className="flex items-center gap-0.5 text-yellow-400"
      role="img"
      aria-label={`${rounded} étoile${rounded > 1 ? 's' : ''}`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const index = i + 1;
        if (rounded >= index) {
          return <FaStar key={i} className="w-4 h-4" />;
        } else if (rounded >= index - 0.5) {
          return <FaStarHalfAlt key={i} className="w-4 h-4" />;
        } else {
          return <FaRegStar key={i} className="w-4 h-4 text-gray-300" />;
        }
      })}
    </div>
  );
}
