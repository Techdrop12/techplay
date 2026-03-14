interface ProductScoreProps {
  score: number | null | undefined;
}

export default function ProductScore({ score }: ProductScoreProps) {
  if (!score) return null;
  const percentage = Math.round(score * 20);
  return (
    <div className="text-sm text-token-text/70 mt-1">
      Score IA : <span className="font-semibold">{percentage}%</span>
    </div>
  );
}
