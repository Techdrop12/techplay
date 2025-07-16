export default function IconLabel({ icon, label }) {
  return (
    <div className="flex items-center space-x-2 text-sm">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
