// ✅ src/components/ScoreTracker.js

'use client';

import { useEffect, useState } from 'react';

export default function ScoreTracker() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem('userScore');
    setScore(raw ? parseInt(raw, 10) : 0);
  }, []);

  if (score <= 0) return null;

  return (
    <div className="mb-2 text-xs text-right">
      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded">
        Score fidélité : {score}
      </span>
    </div>
  );
}
