import type { ReactNode } from 'react';

interface IconCircleProps {
  icon: ReactNode;
}

export default function IconCircle({ icon }: IconCircleProps) {
  return <div className="rounded-full bg-[hsl(var(--surface-2))] p-2">{icon}</div>;
}
