// ✅ /src/components/ScrollProgress.js (bonus bar de progression lecture, UX)
'use client';

import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = Math.max(0, Math.min(1, scrollTop / docHeight));
      setProgress(percent);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div
        className="bg-blue-600 h-1 transition-all"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
