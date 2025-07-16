export default function Overlay({ visible }) {
  if (!visible) return null;
  return <div className="fixed inset-0 bg-black/40 z-40"></div>;
}
