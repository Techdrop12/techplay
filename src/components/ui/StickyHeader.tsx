'use client';

import { useEffect, useState } from 'react';

import type { ReactNode } from 'react';

interface StickyHeaderProps {
  children: ReactNode;
}

export default function StickyHeader({ children }: StickyHeaderProps) {
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
      className={`fixed top-0 left-0 w-full bg-[hsl(var(--surface))] border-b border-[hsl(var(--border))] shadow-[var(--shadow-sm)] z-50 transition-all duration-300 ${
        sticky ? 'py-2' : 'py-4'
      }`}
    >
      {children}
    </header>
  );
}
