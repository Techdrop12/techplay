'use client';

export default function Alert({ type = 'info', children }) {
  const colors = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };
  const colorClass = colors[type] || colors.info;

  return (
    <div className={`p-4 rounded-md ${colorClass}`}>
      {children}
    </div>
  );
}
