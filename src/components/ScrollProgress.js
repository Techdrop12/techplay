'use client';
import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const updateScroll = () => {
      const progress = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      setScroll(progress);
    };

    window.addEventListener('scroll', updateScroll);
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-200">
      <div
        className="h-1 bg-blue-600 transition-all duration-300"
        style={{ width: `${scroll}%` }}
      />
    </div>
  );
}
