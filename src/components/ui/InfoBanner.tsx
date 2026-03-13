import type { ReactNode } from 'react';

type InfoBannerType = 'info' | 'success' | 'warning' | 'error';

interface InfoBannerProps {
  message: ReactNode;
  type?: InfoBannerType;
}

const colors: Record<InfoBannerType, string> = {
  info: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
};

export default function InfoBanner({ message, type = 'info' }: InfoBannerProps) {
  return (
    <div className={`p-3 rounded text-sm ${colors[type] ?? colors.info}`}>
      {message}
    </div>
  );
}
