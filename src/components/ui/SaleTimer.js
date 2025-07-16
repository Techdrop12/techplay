'use client';
import { useEffect, useState } from 'react';

export default function SaleTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const end = new Date(endDate);
      const now = new Date();
      const diff = end - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft('Terminé');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return <div className="text-red-600 font-bold">⏳ {timeLeft}</div>;
}
