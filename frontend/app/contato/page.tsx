'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const QUICK_ACTIONS = [
  'Quero visitar novamente',
  'Quero participar da juventude',
  'Quero conversar com um líder',
  'Tenho uma dúvida',
];

export default function ContatoPage() {
  const [quickAction, setQuickAction] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Informe seu nome.');
      return;
    }

    setLoading(true);
    try {
      await api.contact({ quickAction, name, phone, message });
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
        <Header title="Fale Conosco" />
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-4">
          <h2 className="font-display font-bold text-xl text-brand-bluedeep">Mensagem enviada!</h2>
          <p className="text-brand-gray text-sm">Em breve alguém da liderança vai te responder.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 pb-12 max-w-md mx-auto">
      <Header title="Fale Conosco" />

      <div className="grid grid-cols-2 gap-2 mb-6">
        {QUICK_ACTIONS.map((qa) => (
          <button
            key={qa}
            type="button"
            onClick={() => setQuickAction(qa)}
            className={`text-left text-sm px-3.5 py-3 rounded-xl border font-medium transition-colors ${
              quickAction === qa ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-brand-bluedeep border-gray-200'
            }`}
          >
            {qa}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-brand-bluedeep mb-1.5" htmlFor="name">
            Nome *
          </label>
          <input
            id="name"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-bluedeep mb-1.5" htmlFor="phone">
            Telefone (WhatsApp)
          </label>
          <input
            id="phone"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-bluedeep mb-1.5" htmlFor="message">
            Mensagem
          </label>
          <textarea
            id="message"
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-blue text-white font-display font-semibold py-3.5 disabled:opacity-60"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Enviando...' : 'Enviar mensagem'}
        </button>
      </form>
    </main>
  );
}
