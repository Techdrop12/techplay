'use client';

import { useEffect, useState } from 'react';

export default function StickyHeader({ children }) {
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md z-50 transition-all duration-300 ${
        sticky ? 'py-2' : 'py-4'
      }`}
    >
      {children}
    </header>
  );
}
