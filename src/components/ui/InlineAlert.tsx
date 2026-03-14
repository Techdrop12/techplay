import type { ReactNode } from 'react';

type InlineAlertType = 'info' | 'success' | 'error';

interface InlineAlertProps {
  message: ReactNode;
  type?: InlineAlertType;
}

const variants: Record<InlineAlertType, string> = {
  info: 'text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.12)]',
  success: 'text-green-600 bg-green-100',
  error: 'text-red-600 bg-red-100',
};

export default function InlineAlert({ message, type = 'info' }: InlineAlertProps) {
  return (
    <div className={`p-2 text-sm rounded ${variants[type]}`}>
      {message}
    </div>
  );
}
