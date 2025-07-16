export default function InlineAlert({ message, type = 'info' }) {
  const variants = {
    info: 'text-blue-600 bg-blue-100',
    success: 'text-green-600 bg-green-100',
    error: 'text-red-600 bg-red-100',
  };
  return (
    <div className={`p-2 text-sm rounded ${variants[type]}`}>
      {message}
    </div>
  );
}
