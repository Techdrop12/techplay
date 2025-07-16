export default function Button({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-900 transition"
    >
      {children}
    </button>
  );
}
