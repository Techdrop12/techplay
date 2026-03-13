'use client';

import type { ReactNode } from 'react';

interface ButtonGroupProps {
  children: ReactNode;
}

export default function ButtonGroup({ children }: ButtonGroupProps) {
  return <div className="inline-flex space-x-2">{children}</div>;
}
