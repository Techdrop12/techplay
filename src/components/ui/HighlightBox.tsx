import type { ReactNode } from 'react';

interface HighlightBoxProps {
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
}

export default function HighlightBox({ icon, title, subtitle }: HighlightBoxProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] shadow-[var(--shadow-sm)] rounded-xl">
      {icon && <div className="text-[hsl(var(--accent))]">{icon}</div>}
      <div>
        <p className="font-bold text-[hsl(var(--text))]">{title}</p>
        {subtitle != null && <p className="text-sm text-token-text/65">{subtitle}</p>}
      </div>
    </div>
  );
}
