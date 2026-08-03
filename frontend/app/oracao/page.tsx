'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { Loader2, HeartHandshake } from 'lucide-react';

const CATEGORIES = ['Família', 'Vida espiritual', 'Estudos', 'Trabalho', 'Saúde', 'Ministério', 'Outro'];

export default function PrayerPage() {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [wantsPrayer, setWantsPrayer] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!category || !description.trim() || wantsPrayer === null) {
      setError('Escolha uma categoria, escreva seu pedido e responda se deseja receber oração.');
      return;
    }

    setLoading(true);
    try {
      await api.prayer({ category, description, wantsPrayer });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Não foi possível enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen px-5 pb-12 max-w-md mx-auto flex flex-col">
        <Header title="Pedido de Oração" />
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldsoft text-brand-blue">
            <HeartHandshake size={32} />
          </span>
          <h2 className="font-display font-bold text-xl text-brand-bluedeep">Recebemos seu pedido!</h2>
          <p className="text-brand-gray text-sm">Nossa equipe de intercessão vai orar por você. Deus abençoe!</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 pb-12 max-w-md mx-auto">
      <Header title="Pedido de Oração" />
      <p className="text-sm text-brand-gray mb-6 px-1">
        Compartilhe conosco o que está em seu coração. Vamos orar juntos.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <span className="block text-sm font-semibold text-brand-bluedeep mb-2">Categoria *</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${
                  category === c ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-brand-bluedeep border-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-bluedeep mb-1.5" htmlFor="description">
            Seu pedido *
          </label>
          <textarea
            id="description"
            rows={5}
            maxLength={500}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base resize-none"
            placeholder="Escreva aqui seu pedido de oração..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-xs text-brand-gray text-right mt-1">{description.length}/500</p>
        </div>

        <div>
          <span className="block text-sm font-semibold text-brand-bluedeep mb-2">
            Deseja receber oração da equipe? *
          </span>
          <div className="flex gap-2">
            {[
              { v: true, label: 'Sim' },
              { v: false, label: 'Não' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.label}
                onClick={() => setWantsPrayer(opt.v)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors ${
                  wantsPrayer === opt.v ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-brand-bluedeep border-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-blue text-white font-display font-semibold py-3.5 disabled:opacity-60"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Enviando...' : 'Enviar pedido'}
        </button>
      </form>
    </main>
  );
}
