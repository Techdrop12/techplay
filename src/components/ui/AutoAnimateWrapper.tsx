'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';

import type { ReactNode } from 'react';

interface AutoAnimateWrapperProps {
  children: ReactNode;
}

export default function AutoAnimateWrapper({ children }: AutoAnimateWrapperProps) {
  const [parent] = useAutoAnimate<HTMLDivElement>();
  return <div ref={parent}>{children}</div>;
}
