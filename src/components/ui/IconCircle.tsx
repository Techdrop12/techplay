import type { ReactNode } from 'react';

interface IconCircleProps {
  icon: ReactNode;
}

export default function IconCircle({ icon }: IconCircleProps) {
  return <div className="rounded-full bg-gray-100 p-2">{icon}</div>;
}
