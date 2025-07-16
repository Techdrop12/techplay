'use client';

import { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function StarRating({ rating, maxStars = 5, className = '' }) {
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="text-yellow-400 inline" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 inline" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-400 inline" />);
    }
  }

  return <div className={`inline-flex gap-1 ${className}`}>{stars}</div>;
}
