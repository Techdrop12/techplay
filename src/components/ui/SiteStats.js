export default function SiteStats({ stats = [] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center py-6">
      {stats.map((stat, i) => (
        <div key={i}>
          <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
          <p className="text-sm text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
