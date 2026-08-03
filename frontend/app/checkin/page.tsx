'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { Share2, Loader2 } from 'lucide-react';

const LEADERSHIP_FLAGS = [
  { key: 'hasDirigente', label: 'Dirigente' },
  { key: 'hasViceDirigente', label: 'Vice Dirigente' },
] as const;

export default function CheckinPage() {
  const [form, setForm] = useState({
    umadalpeName: '',
    hostUmadalpe: 'Maranguape II Baixo',
    hasDirigente: false,
    hasViceDirigente: false,
    secretariasCount: 0,
    auxiliaresCount: 0,
    maestrosCount: 0,
    membersCount: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [card, setCard] = useState<{ umadalpeName: string; edificationWord: string; verse: string } | null>(null);

  function toggleFlag(key: 'hasDirigente' | 'hasViceDirigente') {
    setForm((f) => ({ ...f, [key]: !f[key] }));
  }

  function updateCount(key: 'secretariasCount' | 'auxiliaresCount' | 'maestrosCount', value: string) {
    const n = Math.max(0, parseInt(value || '0', 10));
    setForm((f) => ({ ...f, [key]: Number.isNaN(n) ? 0 : n }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.umadalpeName.trim() || !form.membersCount) {
      setError('Preencha o nome da UMADALPE e a quantidade de componentes.');
      return;
    }

    setLoading(true);
    try {
      const res: any = await api.checkin({
        ...form,
        membersCount: parseInt(form.membersCount, 10),
      });
      setCard(res.card);
      api.mosaicAdd({ umadalpeName: form.umadalpeName }).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'Não foi possível enviar o check-in. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (card) {
    return (
      <main className="min-h-screen px-5 pb-12 max-w-md mx-auto">
        <Header title="Check-in confirmado" />
        <div className="rounded-3xl overflow-hidden shadow-card bg-gradient-to-br from-brand-blue via-brand-bluedeep to-black text-white p-6 aspect-[9/16] flex flex-col justify-between">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-brand-gold font-semibold">Conecta UMADALPE</p>
            <p className="text-xs text-white/60 mt-1">Aniversário UMADALPE Maranguape II Baixo</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/70 mb-2">A UMADALPE</p>
            <p className="font-display font-bold text-2xl leading-tight">{card.umadalpeName}</p>
            <p className="text-sm text-white/70 mt-4 mb-1">chega com a palavra</p>
            <p className="font-display font-bold text-4xl text-brand-gold">{card.edificationWord}</p>
          </div>
          <p className="text-xs text-white/60 italic text-center">{card.verse}</p>
        </div>

        <button
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-gold text-brand-bluedeep font-display font-semibold py-3.5"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'Conecta UMADALPE', text: `${card.umadalpeName} chegou com a palavra ${card.edificationWord}!` });
            }
          }}
        >
          <Share2 size={18} /> Compartilhar no Instagram
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 pb-12 max-w-md mx-auto">
      <Header title="Check-in da Caravana" />
      <p className="text-sm text-brand-gray mb-6 px-1">
        Registre a chegada da sua UMADALPE e receba um card digital para compartilhar!
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-brand-bluedeep mb-1.5" htmlFor="umadalpeName">
            Nome da UMADALPE *
          </label>
          <input
            id="umadalpeName"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base"
            placeholder="Ex: UMADALPE Sede"
            value={form.umadalpeName}
            onChange={(e) => setForm((f) => ({ ...f, umadalpeName: e.target.value }))}
          />
        </div>

        <div>
          <span className="block text-sm font-semibold text-brand-bluedeep mb-2">Quem veio na direção?</span>
          <div className="flex flex-wrap gap-2">
            {LEADERSHIP_FLAGS.map(({ key, label }) => (
              <button
                type="button"
                key={key}
                onClick={() => toggleFlag(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  form[key] ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-brand-bluedeep border-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-brand-bluedeep mb-1.5" htmlFor="secretarias">
              Secretárias
            </label>
            <input
              id="secretarias"
              type="number"
              min={0}
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base"
              value={form.secretariasCount}
              onChange={(e) => updateCount('secretariasCount', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-bluedeep mb-1.5" htmlFor="auxiliares">
              Auxiliares
            </label>
            <input
              id="auxiliares"
              type="number"
              min={0}
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base"
              value={form.auxiliaresCount}
              onChange={(e) => updateCount('auxiliaresCount', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-bluedeep mb-1.5" htmlFor="maestros">
              Maestros(as)
            </label>
            <input
              id="maestros"
              type="number"
              min={0}
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base"
              value={form.maestrosCount}
              onChange={(e) => updateCount('maestrosCount', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-bluedeep mb-1.5" htmlFor="membersCount">
            Quantidade de componentes *
          </label>
          <input
            id="membersCount"
            type="number"
            min={1}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base"
            placeholder="Ex: 25"
            value={form.membersCount}
            onChange={(e) => setForm((f) => ({ ...f, membersCount: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-bluedeep mb-1.5" htmlFor="host">
            UMADALPE Anfitriã
          </label>
          <input
            id="host"
            disabled
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-brand-gray"
            value={form.hostUmadalpe}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-blue text-white font-display font-semibold py-3.5 disabled:opacity-60"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Enviando...' : 'Confirmar check-in'}
        </button>
      </form>
    </main>
  );
}
