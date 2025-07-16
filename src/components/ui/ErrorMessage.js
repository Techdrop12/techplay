export default function ErrorMessage({ message }) {
  return (
    <div className="bg-red-100 text-red-700 p-2 rounded text-sm my-2 border border-red-300">
      ⚠️ {message}
    </div>
  );
}
