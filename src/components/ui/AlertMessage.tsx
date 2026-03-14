import type { ReactNode } from 'react';

type AlertMessageType = 'info' | 'success' | 'warning' | 'error';

interface AlertMessageProps {
  type?: AlertMessageType;
  message: ReactNode;
}

const colors: Record<AlertMessageType, string> = {
  info: 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] dark:bg-[hsl(var(--accent)/0.2)]',
  success:
    'bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))] dark:bg-[hsl(var(--success)/0.25)] dark:text-[hsl(var(--success)/0.95)]',
  warning:
    'bg-[hsl(var(--warning)/0.2)] text-[hsl(38_92%_28%)] dark:bg-[hsl(var(--warning)/0.25)] dark:text-[hsl(38_92%_88%)]',
  error:
    'bg-[hsl(var(--danger)/0.15)] text-[hsl(var(--danger))] dark:bg-[hsl(var(--danger)/0.25)] dark:text-[hsl(var(--danger)/0.95)]',
};

export default function AlertMessage({ type = 'info', message }: AlertMessageProps) {
  return (
    <div className={`mb-4 rounded-[var(--radius)] p-4 ${colors[type]}`} role="alert">
      {message}
    </div>
  );
}
