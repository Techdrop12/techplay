'use client';

interface EmptyStateProps {
  message: React.ReactNode;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-token-text/60" role="status" aria-live="polite">
      {message}
    </div>
  );
}
