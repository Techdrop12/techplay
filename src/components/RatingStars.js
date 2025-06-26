// ✅ src/components/RatingStars.js

import React from 'react';

export default function RatingStars({ value = 0, max = 5 }) {
  const rounded = Math.round(value * 2) / 2;

  return (
    <div className="flex items-center">
      {[...Array(max)].map((_, i) => {
        const fill =
          rounded >= i + 1
            ? 'text-yellow-400'
            : rounded >= i + 0.5
            ? 'text-yellow-400 half'
            : 'text-gray-300';
        return (
          <span
            key={i}
            className={`relative inline-block text-lg mr-0.5 ${fill}`}
            style={
              fill === 'text-yellow-400 half'
                ? {
                    background:
                      'linear-gradient(90deg, #facc15 50%, #e5e7eb 50%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }
                : {}
            }
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
