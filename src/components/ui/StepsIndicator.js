export default function StepsIndicator({ current = 1, steps = [] }) {
  return (
    <div className="flex justify-center items-center gap-4 py-4">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center
            ${i + 1 === current ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}>
            {i + 1}
          </div>
          <span className="text-sm">{step}</span>
          {i < steps.length - 1 && <span className="w-4 h-1 bg-gray-300" />}
        </div>
      ))}
    </div>
  );
}
