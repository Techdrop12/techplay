import Link from "next/link";

export default function Breadcrumbs({ links }: { links: { href: string; label: string }[] }) {
  return (
    <nav className="text-sm text-gray-500 mb-4 space-x-1">
      {links.map((link, index) => (
        <span key={index}>
          {index > 0 && " / "}
          <Link href={link.href} className="hover:underline">
            {link.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
