export default function Pill({ text, color = 'blue' }) {
  return (
    <span className={`text-xs px-3 py-1 rounded-full bg-${color}-100 text-${color}-800`}>
      {text}
    </span>
  );
}
