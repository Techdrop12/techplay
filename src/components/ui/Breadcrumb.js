import Link from 'next/link';

export default function Breadcrumb({ segments = [] }) {
  return (
    <nav className="text-sm text-gray-500 mb-4">
      <ol className="list-reset flex">
        <li>
          <Link href="/" className="hover:underline text-blue-600">Accueil</Link>
        </li>
        {segments.map((seg, i) => (
          <li key={i} className="mx-2">/</li>,
          <li key={`${i}-segment`}>
            <Link href={seg.href} className="hover:underline text-blue-600">{seg.label}</Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
