import { ClipboardList, HandHeart, Users, CalendarDays, MessageCircleHeart } from 'lucide-react';
import { BigCard } from '@/components/BigCard';

export default function HomePage() {
  return (
    <main className="min-h-screen px-5 pb-12 pt-10 max-w-md mx-auto">
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.2em] font-semibold text-brand-gold uppercase mb-2">
          UMADALPE Maranguape II Baixo
        </p>
        <h1 className="font-display font-bold text-3xl text-brand-bluedeep leading-tight">
          Bem-vindo(a) à nossa festa!
        </h1>
        <p className="mt-3 text-brand-gray text-sm leading-relaxed">
          Acolhimento e união. Jovens com propósito.
          <br />
          Permanecer conectado.
        </p>
        <blockquote className="mt-5 card-surface px-4 py-3 text-sm italic text-brand-bluedeep">
          &ldquo;Oh! Quão bom e quão suave é que os irmãos vivam em união!&rdquo;
          <footer className="mt-1 not-italic text-xs text-brand-gray">Salmos 133:1</footer>
        </blockquote>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <BigCard href="/checkin" icon={ClipboardList} label="Check-in da Caravana" accent="gold" />
        <BigCard href="/oracao" icon={HandHeart} label="Pedido de Oração" />
        <BigCard href="/sobre" icon={Users} label="Conheça a UMADALPE" />
        <BigCard href="/agenda" icon={CalendarDays} label="Agenda" />
        <div className="col-span-2">
          <BigCard href="/contato" icon={MessageCircleHeart} label="Fale Conosco" accent="gold" />
        </div>
      </div>
    </main>
  );
}
