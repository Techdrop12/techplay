import type { ReactNode } from 'react';

type AlertMessageType = 'info' | 'success' | 'warning' | 'error';

interface AlertMessageProps {
  type?: AlertMessageType;
  message: ReactNode;
}

const colors: Record<AlertMessageType, string> = {
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};

export default function AlertMessage({ type = 'info', message }: AlertMessageProps) {
  return (
    <div className={`p-4 rounded mb-4 ${colors[type]}`}>
      {message}
    </div>
  );
}
