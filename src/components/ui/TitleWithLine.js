export default function TitleWithLine({ title }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="h-px flex-1 bg-gray-300" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="h-px flex-1 bg-gray-300" />
    </div>
  );
}
