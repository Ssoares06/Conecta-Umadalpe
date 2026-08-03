'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Flame, HandHeart, Church } from 'lucide-react';

interface Stats {
  umadalpesPresent: number;
  totalYoungConnected: number;
  prayerRequests: number;
  mosaicMarks: number;
}

interface Pixel {
  umadalpeName: string;
  color: string;
  slot: number;
}

const GRID_SIZE = 400; // 20x20

export default function TvPage() {
  const [stats, setStats] = useState<Stats>({
    umadalpesPresent: 0,
    totalYoungConnected: 0,
    prayerRequests: 0,
    mosaicMarks: 0,
  });
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [theme, setTheme] = useState('Aniversário UMADALPE Maranguape II Baixo');
  const [intercession, setIntercession] = useState<{ active: boolean; prayer: any }>({ active: false, prayer: null });
  const [intercedingCount, setIntercedingCount] = useState(0);
  const [hoverName, setHoverName] = useState<string | null>(null);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
    api.mosaic().then((r) => setPixels(r.pixels || [])).catch(() => {});
    api.settings().then((s) => {
      if (s.event_theme) setTheme(s.event_theme);
    }).catch(() => {});

    const es = new EventSource(api.streamUrl());
    es.addEventListener('stats', (e) => setStats(JSON.parse((e as MessageEvent).data)));
    es.addEventListener('mosaic_pixel', (e) => {
      const pixel = JSON.parse((e as MessageEvent).data);
      setPixels((prev) => [...prev, pixel]);
    });
    es.addEventListener('intercession_mode', (e) => setIntercession(JSON.parse((e as MessageEvent).data)));
    es.addEventListener('interceding_count', (e) => setIntercedingCount(JSON.parse((e as MessageEvent).data).count));

    return () => es.close();
  }, []);

  const filledSlots = new Map(pixels.map((p) => [p.slot, p]));

  if (intercession.active) {
    return (
      <main className="min-h-screen w-full bg-gradient-to-b from-black via-brand-bluedeep to-black text-white flex flex-col items-center justify-center px-16 text-center">
        <div className="absolute inset-0 animate-pulseGlow bg-gradient-to-t from-brand-gold/10 to-transparent pointer-events-none" />
        <p className="text-brand-gold uppercase tracking-[0.4em] text-sm font-semibold mb-6">Momento de Intercessão</p>
        <p className="text-xs uppercase tracking-widest text-white/50 mb-3">{intercession.prayer?.category}</p>
        <p className="font-display font-bold text-4xl leading-tight max-w-4xl">{intercession.prayer?.description}</p>
        <p className="mt-10 text-white/70 text-lg">🙏 {intercedingCount} jovens estão intercedendo agora</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-brand-bluedeep text-white flex flex-col overflow-hidden">
      {/* Topo fixo */}
      <div className="flex items-center justify-between px-10 py-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-gold font-semibold">UMADALPE Maranguape II Baixo</p>
          <h1 className="font-display font-bold text-3xl">{theme}</h1>
        </div>
        <p className="text-white/60 text-sm">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
      </div>

      {/* Centro: Mosaico da Adoração */}
      <div className="flex-1 flex flex-col items-center justify-center px-10">
        <p className="text-sm uppercase tracking-widest text-white/60 mb-4">Mosaico da Adoração</p>
        <div
          className="grid gap-[3px] w-full max-w-4xl"
          style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }}
        >
          {Array.from({ length: GRID_SIZE }).map((_, i) => {
            const slot = i + 1;
            const pixel = filledSlots.get(slot);
            return (
              <div
                key={slot}
                onMouseEnter={() => pixel && setHoverName(pixel.umadalpeName)}
                onMouseLeave={() => setHoverName(null)}
                className="aspect-square rounded-[3px] transition-colors duration-500"
                style={{ backgroundColor: pixel ? pixel.color : 'rgba(255,255,255,0.06)' }}
                title={pixel?.umadalpeName}
              />
            );
          })}
        </div>
        <p className="mt-5 text-white/70 text-sm">
          {hoverName ? hoverName : `${stats.mosaicMarks} jovens já deixaram sua marca`}
        </p>
      </div>

      {/* Rodapé fixo: contadores */}
      <div className="grid grid-cols-3 gap-4 px-10 py-8 bg-black/20">
        <StatBlock icon={<Flame size={22} />} label="jovens conectados" value={stats.totalYoungConnected} />
        <StatBlock icon={<HandHeart size={22} />} label="pedidos de oração" value={stats.prayerRequests} />
        <StatBlock icon={<Church size={22} />} label="UMADALPEs presentes" value={stats.umadalpesPresent} />
      </div>
    </main>
  );
}

function StatBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 justify-center">
      <span className="text-brand-gold">{icon}</span>
      <div>
        <p className="font-display font-bold text-2xl leading-none">{value}</p>
        <p className="text-xs text-white/60">{label}</p>
      </div>
    </div>
  );
}
