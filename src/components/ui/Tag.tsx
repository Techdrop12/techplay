interface TagProps {
  label: string;
}

export default function Tag({ label }: TagProps) {
  return (
    <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded mr-1 mb-1">
      {label}
    </span>
  );
}
