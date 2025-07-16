export default function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-2xl md:text-3xl font-bold text-center mt-16 mb-6">{title}</h2>
  );
}
