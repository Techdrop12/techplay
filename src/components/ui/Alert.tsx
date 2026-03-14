'use client';

import type { ReactNode } from 'react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  type?: AlertType;
  children: ReactNode;
}

const colors: Record<AlertType, string> = {
  info: 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};

export default function Alert({ type = 'info', children }: AlertProps) {
  const colorClass = colors[type] ?? colors.info;

  return (
    <div className={`p-4 rounded-md ${colorClass}`}>
      {children}
    </div>
  );
}
