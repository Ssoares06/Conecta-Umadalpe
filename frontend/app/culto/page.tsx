'use client';

import { useEffect, useState } from 'react';
import { Church, Users, HeartHandshake } from 'lucide-react';
import { api } from '@/lib/api';

export default function CultoPage() {
  const [stats, setStats] = useState({ umadalpesPresent: 0, totalYoungConnected: 0 });
  const [theme, setTheme] = useState('Culto de celebração');

  useEffect(() => {
    async function load() {
      const [nextStats, settings] = await Promise.all([api.stats(), api.settings()]);
      setStats(nextStats);
      if (settings.event_theme) setTheme(settings.event_theme);
    }
    load().catch(() => {});
    const interval = window.setInterval(async () => {
      try { setStats(await api.stats()); } catch {}
    }, 15000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-brand-bluedeep text-white flex flex-col">
      <header className="px-6 pt-8 pb-6 text-center border-b border-white/10">
        <p className="text-brand-gold text-xs uppercase tracking-[0.35em] font-semibold">UMADALPE Maranguape II Baixo</p>
        <h1 className="font-display font-bold text-3xl sm:text-5xl mt-3">{theme}</h1>
        <p className="text-white/65 mt-3">Seja bem-vinda, UMADALPE visitante!</p>
      </header>

      <section className="flex-1 flex flex-col justify-center px-6 max-w-5xl mx-auto w-full">
        <div className="grid sm:grid-cols-2 gap-5">
          <Counter icon={<Church size={30} />} value={stats.umadalpesPresent} label="UMADALPEs visitantes recebidas" />
          <Counter icon={<Users size={30} />} value={stats.totalYoungConnected} label="visitantes no culto" />
        </div>
        <div className="mt-10 text-center rounded-3xl border border-brand-gold/30 bg-white/5 p-8">
          <HeartHandshake className="mx-auto text-brand-gold" size={38} />
          <p className="font-display font-semibold text-2xl mt-4">Cada chegada é motivo de alegria.</p>
          <p className="text-white/65 mt-2">&ldquo;Oh! Quão bom e quão suave é que os irmãos vivam em união!&rdquo; — Salmos 133:1</p>
        </div>
      </section>
      <footer className="text-center text-xs text-white/45 px-6 py-5">Atualização automática a cada 15 segundos · Use em tela cheia na projeção do culto</footer>
    </main>
  );
}

function Counter({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-3xl bg-white text-brand-bluedeep p-7 text-center shadow-card">
      <div className="text-brand-gold mx-auto w-fit">{icon}</div>
      <p className="font-display font-bold text-5xl mt-3">{value}</p>
      <p className="text-sm text-brand-gray mt-2">{label}</p>
    </div>
  );
}
