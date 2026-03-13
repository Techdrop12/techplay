// ✅ /src/components/ScoreTracker.js (bonus engagement UX)
'use client';

import { useEffect, useState } from 'react';

export default function ScoreTracker() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const val = Number(localStorage.getItem('score') || 0);
      setScore(val);
    }
  }, []);

  return (
    <div className="mb-2 text-sm text-blue-800">
      Score TechPlay : <span className="font-bold">{score}</span>
    </div>
  );
}
