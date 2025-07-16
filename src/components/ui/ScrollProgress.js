'use client';

import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      setScroll((scrollTop / docHeight) * 100);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
      <div
        className="h-1 bg-blue-600 transition-all duration-150 ease-out"
        style={{ width: `${scroll}%` }}
      />
    </div>
  );
}
