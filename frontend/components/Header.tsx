import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function Header({ title, back = true }: { title: string; back?: boolean }) {
  return (
    <header className="flex items-center gap-3 px-5 pt-6 pb-4">
      {back && (
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-card text-brand-blue"
          aria-label="Voltar ao início"
        >
          <ArrowLeft size={20} />
        </Link>
      )}
      <h1 className="font-display font-semibold text-xl text-brand-bluedeep">{title}</h1>
    </header>
  );
}
