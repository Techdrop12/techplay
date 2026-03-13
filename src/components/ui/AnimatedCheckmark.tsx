'use client';
import { useEffect, useState } from 'react';

export default function AnimatedCheckmark() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-16 h-16 mx-auto my-8">
      <svg
        viewBox="0 0 52 52"
        className={`w-full h-full ${show ? 'animate-[stroke_0.5s_ease-in-out_forwards]' : 'opacity-0'}`}
      >
        <circle cx="26" cy="26" r="25" fill="none" stroke="#4ade80" strokeWidth="2" />
        <path
          fill="none"
          stroke="#4ade80"
          strokeWidth="3"
          d="M14 27l7 7 16-16"
          className={`${show ? 'animate-[stroke-check_0.5s_ease-in-out_0.5s_forwards]' : ''}`}
        />
      </svg>
    </div>
  );
}
