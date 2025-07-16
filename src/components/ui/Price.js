export default function Price({ value, locale = 'fr' }) {
  return (
    <span className="font-semibold">
      {new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(value)}
    </span>
  );
}
