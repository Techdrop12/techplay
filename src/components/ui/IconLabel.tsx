import type { ReactNode } from 'react';

interface IconLabelProps {
  icon: ReactNode;
  label: string;
}

export default function IconLabel({ icon, label }: IconLabelProps) {
  return (
    <div className="flex items-center space-x-2 text-sm">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
