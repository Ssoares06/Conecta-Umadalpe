import { ClipboardList, MonitorPlay } from 'lucide-react';
import { BigCard } from '@/components/BigCard';

export default function HomePage() {
  return (
    <main className="min-h-screen px-5 pb-12 pt-10 max-w-md mx-auto">
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.2em] font-semibold text-brand-gold uppercase mb-2">
          UMADALPE Maranguape II Baixo
        </p>

        <h1 className="font-display font-bold text-3xl text-brand-bluedeep leading-tight">
          Chegou para o culto?
        </h1>

        <p className="mt-3 text-brand-gray text-sm leading-relaxed">
          Faça o registro da sua UMADALPE na chegada. O painel do culto
          acompanha, ao vivo, cada caravana que Deus trouxe até aqui.
        </p>

        <blockquote className="mt-5 card-surface px-4 py-3 text-sm italic text-brand-bluedeep">
          &ldquo;Oh! Quão bom e quão suave é que os irmãos vivam em união!&rdquo;
          <footer className="mt-1 not-italic text-xs text-brand-gray">
            Salmos 133:1
          </footer>
        </blockquote>
      </div>

      <div className="grid gap-4">
        <BigCard
          href="/checkin"
          icon={ClipboardList}
          label="Registrar uma UMADALPE visitante"
          accent="gold"
        />

        <BigCard href="/culto" icon={MonitorPlay} label="Painel do culto" />
      </div>

      <p className="mt-8 text-center text-xs text-brand-gray">
        Acesso da equipe: <a href="/admin" className="underline">painel administrativo</a>
      </p>
    </main>
  );
}
