'use client';

import { useEffect, useState } from 'react';

export default function ScrollProgressBar() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      setScroll((scrolled / maxScroll) * 100);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div className="h-1 bg-blue-600" style={{ width: `${scroll}%` }} />
    </div>
  );
}
