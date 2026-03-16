import { cn } from '@/lib/utils';

type Props = {
  title: string;
  subtitle?: string;
  className?: string;
};

export default function SectionTitle({ title, subtitle, className }: Props) {
  return (
    <header className={cn('text-center mt-16 mb-6', className)}>
      <h2 className="heading-section">{title}</h2>
      {subtitle && <p className="mt-4 heading-section-sub max-w-2xl mx-auto">{subtitle}</p>}
    </header>
  );
}
