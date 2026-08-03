'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Lock, Download, CheckCircle2, Radio, LogOut } from 'lucide-react';

const TOKEN_KEY = 'conecta_admin_token';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [dashboard, setDashboard] = useState<any>(null);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [verse, setVerse] = useState('');
  const [tab, setTab] = useState<'dashboard' | 'prayers' | 'content'>('dashboard');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    loadDashboard();
    loadPrayers();
  }, [token]);

  async function loadDashboard() {
    if (!token) return;
    try {
      const res = await api.adminDashboard(token);
      setDashboard(res);
    } catch {
      handleLogout();
    }
  }

  async function loadPrayers() {
    if (!token) return;
    const res = await api.adminPrayers(token);
    setPrayers(res.items || []);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    try {
      await api.adminLogin(tokenInput);
      localStorage.setItem(TOKEN_KEY, tokenInput);
      setToken(tokenInput);
    } catch {
      setLoginError('Token inválido.');
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  async function markPrayed(id: number) {
    if (!token) return;
    await api.adminMarkPrayed(token, id);
    loadPrayers();
  }

  async function saveVerse() {
    if (!token || !verse.trim()) return;
    await api.adminUpdateSetting(token, 'verse_of_day', verse);
    setVerse('');
  }

  async function activateIntercession(prayerId: number) {
    if (!token) return;
    await api.adminActivateIntercession(token, prayerId);
  }

  async function deactivateIntercession() {
    if (!token) return;
    await api.adminDeactivateIntercession(token);
  }

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center px-5">
        <form onSubmit={handleLogin} className="card-surface p-6 w-full max-w-sm space-y-4">
          <div className="flex items-center gap-2 text-brand-blue">
            <Lock size={20} />
            <h1 className="font-display font-semibold text-lg text-brand-bluedeep">Painel Administrativo</h1>
          </div>
          <input
            type="password"
            placeholder="Token de acesso"
            className="w-full rounded-xl border border-gray-200 px-4 py-3"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
          />
          {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          <button className="w-full rounded-xl bg-brand-blue text-white font-display font-semibold py-3">
            Entrar
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 pb-16 max-w-3xl mx-auto pt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-brand-bluedeep">Painel Administrativo</h1>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-brand-gray">
          <LogOut size={16} /> Sair
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['dashboard', 'prayers', 'content'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              tab === t ? 'bg-brand-blue text-white' : 'bg-white text-brand-bluedeep border border-gray-200'
            }`}
          >
            {t === 'dashboard' ? 'Dashboard' : t === 'prayers' ? 'Intercessão' : 'Conteúdo'}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && dashboard && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['UMADALPEs presentes', dashboard.stats.umadalpesPresent],
              ['Jovens conectados', dashboard.stats.totalYoungConnected],
              ['Pedidos de oração', dashboard.stats.prayerRequests],
              ['Marcas no mosaico', dashboard.stats.mosaicMarks],
            ].map(([label, value]) => (
              <div key={label as string} className="card-surface p-4">
                <p className="text-2xl font-display font-bold text-brand-blue">{value as number}</p>
                <p className="text-xs text-brand-gray mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="card-surface p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-brand-bluedeep">Caravanas</h2>
              <a
                href={api.exportCaravansUrl()}
                className="flex items-center gap-1.5 text-sm text-brand-blue font-medium"
              >
                <Download size={16} /> Exportar CSV
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-brand-gray border-b">
                    <th className="py-2 pr-3">UMADALPE</th>
                    <th className="py-2 pr-3">Componentes</th>
                    <th className="py-2 pr-3">Direção</th>
                    <th className="py-2">Palavra</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.caravans.map((c: any) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium text-brand-bluedeep">{c.umadalpeName}</td>
                      <td className="py-2 pr-3">{c.membersCount}</td>
                      <td className="py-2 pr-3 text-xs text-brand-gray">
                        {[c.hasDirigente && 'Dirigente', c.hasViceDirigente && 'Vice'].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="py-2 text-brand-gold font-semibold">{c.edificationWord}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'prayers' && (
        <div className="space-y-3">
          {prayers.length === 0 && <p className="text-sm text-brand-gray">Nenhum pedido registrado ainda.</p>}
          {prayers.map((p) => (
            <div key={p.id} className="card-surface p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-brand-gold uppercase">{p.category}</span>
                {p.prayed ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <CheckCircle2 size={14} /> Orado
                  </span>
                ) : (
                  <button onClick={() => markPrayed(p.id)} className="text-xs text-brand-blue font-medium">
                    Marcar como orado
                  </button>
                )}
              </div>
              <p className="text-sm text-brand-bluedeep">{p.description}</p>
              {p.wantsPrayer === 1 && (
                <button
                  onClick={() => activateIntercession(p.id)}
                  className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-brand-blue"
                >
                  <Radio size={14} /> Destacar na TV agora
                </button>
              )}
            </div>
          ))}
          {prayers.length > 0 && (
            <button onClick={deactivateIntercession} className="text-sm text-brand-gray underline">
              Encerrar modo intercessão na TV
            </button>
          )}
        </div>
      )}

      {tab === 'content' && (
        <div className="card-surface p-4 space-y-3">
          <h2 className="font-display font-semibold text-brand-bluedeep">Versículo do dia</h2>
          <textarea
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm resize-none"
            rows={3}
            placeholder="Digite o novo versículo..."
            value={verse}
            onChange={(e) => setVerse(e.target.value)}
          />
          <button onClick={saveVerse} className="rounded-xl bg-brand-blue text-white font-semibold px-5 py-2.5 text-sm">
            Salvar
          </button>
        </div>
      )}
    </main>
  );
}
