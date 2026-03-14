'use client';
import { useEffect, useState } from 'react';

export default function AnimatedCheckmark() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto my-8 h-16 w-16" aria-hidden>
      <svg
        viewBox="0 0 52 52"
        className={`h-full w-full text-[hsl(var(--success))] ${show ? 'animate-[stroke_0.5s_ease-in-out_forwards]' : 'opacity-0'}`}
      >
        <circle cx="26" cy="26" r="25" fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          d="M14 27l7 7 16-16"
          className={show ? 'animate-[stroke-check_0.5s_ease-in-out_0.5s_forwards]' : ''}
        />
      </svg>
    </div>
  );
}
