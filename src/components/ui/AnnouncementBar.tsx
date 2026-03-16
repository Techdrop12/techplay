import type { ReactNode } from 'react';

interface AnnouncementBarProps {
  message: ReactNode;
}

export default function AnnouncementBar({ message }: AnnouncementBarProps) {
  return (
    <div className="bg-yellow-100 text-yellow-800 py-2 px-4 text-sm text-center">{message}</div>
  );
}
