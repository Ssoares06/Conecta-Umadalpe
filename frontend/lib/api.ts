const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any)?.message || (data as any)?.error || 'Erro inesperado');
  }
  return data as T;
}

export const api = {
  checkin: (payload: unknown) => request('/api/checkin', { method: 'POST', body: JSON.stringify(payload) }),
  prayer: (payload: unknown) => request('/api/prayer', { method: 'POST', body: JSON.stringify(payload) }),
  contact: (payload: unknown) => request('/api/contact', { method: 'POST', body: JSON.stringify(payload) }),
  mosaicAdd: (payload: unknown) => request('/api/mosaic/add', { method: 'POST', body: JSON.stringify(payload) }),
  mosaic: () => request<{ pixels: any[] }>('/api/mosaic'),
  settings: () => request<Record<string, string>>('/api/settings'),
  agenda: () => request<{ items: any[] }>('/api/agenda'),
  stats: () => request<any>('/api/stats'),
  intercessionPraying: () => request('/api/intercession/praying', { method: 'POST' }),

  adminLogin: (token: string) => request('/api/admin/login', { method: 'POST', body: JSON.stringify({ token }) }),
  adminDashboard: (token: string) =>
    request<any>('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
  adminPrayers: (token: string, category?: string) =>
    request<any>(`/api/admin/prayers${category ? `?category=${encodeURIComponent(category)}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  adminMarkPrayed: (token: string, id: number) =>
    request(`/api/admin/prayers/${id}/prayed`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  adminUpdateSetting: (token: string, key: string, value: string) =>
    request('/api/admin/settings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ key, value }),
    }),
  adminWords: (token: string) => request<any>('/api/admin/words', { headers: { Authorization: `Bearer ${token}` } }),
  adminAddWord: (token: string, word: string) =>
    request('/api/admin/words', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ word }),
    }),
  adminAddAgenda: (token: string, payload: unknown) =>
    request('/api/admin/agenda', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  adminActivateIntercession: (token: string, prayerId: number) =>
    request('/api/admin/intercession/activate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ prayerId }),
    }),
  adminDeactivateIntercession: (token: string) =>
    request('/api/admin/intercession/deactivate', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  exportCaravansUrl: () => `${API_URL}/api/admin/caravans/export`,
  exportPrayersUrl: () => `${API_URL}/api/admin/prayers/export`,
  streamUrl: () => `${API_URL}/api/stream`,
};

export { API_URL };
