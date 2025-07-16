export default function StepIndicator({ current = 1, steps = 3 }) {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      {Array.from({ length: steps }, (_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full ${i + 1 <= current ? 'bg-blue-600' : 'bg-gray-300'}`}
        />
      ))}
    </div>
  );
}
