'use client';

import { useEffect, useState } from 'react';

export default function Countdown({ until }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const delta = until - new Date();
      if (delta <= 0) return setTimeLeft('00:00:00');

      const h = String(Math.floor(delta / 3600000)).padStart(2, '0');
      const m = String(Math.floor((delta % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((delta % 60000) / 1000)).padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [until]);

  return <span className="font-mono text-sm text-red-600">{timeLeft}</span>;
}
