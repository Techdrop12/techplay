interface ErrorFallbackProps {
  error: Error | unknown;
}

export default function ErrorFallback({ error }: ErrorFallbackProps) {
  return (
    <div role="alert" className="bg-red-100 text-red-700 p-4 rounded">
      <p>Une erreur est survenue :</p>
      <pre className="text-xs mt-2">{error instanceof Error ? error.message : String(error)}</pre>
    </div>
  );
}
