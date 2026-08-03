'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { CalendarDays } from 'lucide-react';

interface AgendaItem {
  id: number;
  title: string;
  eventDate: string;
  description?: string;
}

export default function AgendaPage() {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .agenda()
      .then((res) => setItems(res.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen px-5 pb-12 max-w-md mx-auto">
      <Header title="Agenda" />

      {loading && <p className="text-sm text-brand-gray px-1">Carregando...</p>}

      {!loading && items.length === 0 && (
        <p className="text-sm text-brand-gray px-1">Nenhum evento cadastrado no momento.</p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="card-surface p-4 flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white">
              <CalendarDays size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold text-brand-gold uppercase tracking-wide">{item.eventDate}</p>
              <p className="font-display font-semibold text-brand-bluedeep">{item.title}</p>
              {item.description && <p className="text-sm text-brand-gray mt-1">{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
