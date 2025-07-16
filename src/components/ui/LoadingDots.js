export default function LoadingDots({ className = '' }) {
  return (
    <span className={`inline-flex space-x-1 ${className}`}>
      <span className="animate-bounce">.</span>
      <span className="animate-bounce delay-150">.</span>
      <span className="animate-bounce delay-300">.</span>
    </span>
  );
}
