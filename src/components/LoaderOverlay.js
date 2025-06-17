'use client';
import { useState, useEffect } from 'react';

export default function LoaderOverlay() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800); // durée du loader
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-black flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 border-opacity-50"></div>
    </div>
  );
}
