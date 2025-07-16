'use client';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export default function AutoAnimateWrapper({ children }) {
  const [parent] = useAutoAnimate();
  return <div ref={parent}>{children}</div>;
}
