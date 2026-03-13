import type { ReactNode } from 'react';

interface HighlightBoxProps {
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
}

export default function HighlightBox({ icon, title, subtitle }: HighlightBoxProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 shadow rounded">
      {icon && <div className="text-blue-600">{icon}</div>}
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}
