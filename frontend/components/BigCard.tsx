import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

export function BigCard({
  href,
  icon: Icon,
  label,
  accent = 'blue',
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  accent?: 'blue' | 'gold';
}) {
  const iconBg = accent === 'gold' ? 'bg-brand-goldsoft text-brand-blue' : 'bg-brand-blue text-white';

  return (
    <Link
      href={href}
      className="card-surface flex flex-col items-start gap-4 p-5 min-h-[136px] active:scale-[0.98] transition-transform"
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon size={22} />
      </span>
      <span className="font-display font-semibold text-brand-bluedeep leading-snug">{label}</span>
    </Link>
  );
}
