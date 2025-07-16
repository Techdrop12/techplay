export default function ErrorFallback({ error }) {
  return (
    <div role="alert" className="bg-red-100 text-red-700 p-4 rounded">
      <p>Une erreur est survenue :</p>
      <pre className="text-xs mt-2">{error.message}</pre>
    </div>
  );
}
