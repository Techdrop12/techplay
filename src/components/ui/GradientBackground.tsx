export default function GradientBackground() {
  return (
    <div
      className="absolute inset-0 -z-10 opacity-20"
      style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 100%)',
      }}
    />
  );
}
