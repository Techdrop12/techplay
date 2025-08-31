export default function Badge({ text }: { text: string }) {
  return (
    <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full uppercase tracking-wider">
      {text}
    </span>
  );
}
