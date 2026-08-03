import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { PRAYER_CATEGORIES, MOSAIC_COLORS } from './types';
import {
  rateLimit,
  sanitize,
  sanitizeBool,
  sanitizeInt,
  getClientIp,
  requireAdmin,
} from './helpers';
import { RealtimeRoom } from './realtimeRoom';

export { RealtimeRoom };

const app = new Hono<{ Bindings: Env }>();

app.use('*', async (c, next) => {
  const cors_mw = cors({ origin: c.env.CORS_ORIGIN || '*' });
  return cors_mw(c, next);
});

// Modo manutenção: bloqueia rotas públicas se ativado (exceto /api/admin/*)
app.use('*', async (c, next) => {
  if (c.req.path.startsWith('/api/admin')) return next();
  const row = await c.env.DB.prepare('SELECT value FROM settings WHERE key = ?')
    .bind('maintenance_mode')
    .first<{ value: string }>();
  if (row?.value === 'true' && c.req.path.startsWith('/api')) {
    return c.json({ error: 'maintenance', message: 'Sistema em manutenção. Volte em instantes.' }, 503);
  }
  return next();
});

function getRoom(env: Env) {
  const id = env.REALTIME.idFromName('global');
  return env.REALTIME.get(id);
}

async function broadcast(env: Env, event: string, data: unknown) {
  const room = getRoom(env);
  await room.fetch('https://internal/broadcast', {
    method: 'POST',
    body: JSON.stringify({ event, data }),
  });
}

// ---------------------------------------------------------------
// CHECK-IN DE CARAVANA
// ---------------------------------------------------------------
app.post('/api/checkin', async (c) => {
  const ip = getClientIp(c.req.raw);
  if (!(await rateLimit(c.env, ip, 'checkin', 5, 60))) {
    return c.json({ error: 'rate_limited' }, 429);
  }

  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: 'invalid_body' }, 400);

  const umadalpeName = sanitize(body.umadalpeName, 120);
  const membersCount = sanitizeInt(body.membersCount, 1, 500);
  if (!umadalpeName || membersCount < 1) {
    return c.json({ error: 'validation', message: 'Nome da UMADALPE e quantidade de componentes são obrigatórios.' }, 400);
  }

  const hostUmadalpe = sanitize(body.hostUmadalpe, 120) || 'Maranguape II Baixo';
  const hasDirigente = sanitizeBool(body.hasDirigente);
  const hasViceDirigente = sanitizeBool(body.hasViceDirigente);
  const secretariasCount = sanitizeInt(body.secretariasCount, 0, 50);
  const auxiliaresCount = sanitizeInt(body.auxiliaresCount, 0, 50);
  const maestrosCount = sanitizeInt(body.maestrosCount, 0, 50);

  // Sorteia uma palavra de edificação
  const words = await c.env.DB.prepare('SELECT word FROM edification_words').all<{ word: string }>();
  const wordList = words.results?.map((w) => w.word) || ['Fé'];
  const edificationWord = wordList[Math.floor(Math.random() * wordList.length)];

  const result = await c.env.DB.prepare(
    `INSERT INTO caravans
      (umadalpe_name, host_umadalpe, has_dirigente, has_vice_dirigente, secretarias_count, auxiliares_count, maestros_count, members_count, edification_word)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      umadalpeName,
      hostUmadalpe,
      hasDirigente ? 1 : 0,
      hasViceDirigente ? 1 : 0,
      secretariasCount,
      auxiliaresCount,
      maestrosCount,
      membersCount,
      edificationWord
    )
    .run();

  const verseRow = await c.env.DB.prepare('SELECT value FROM settings WHERE key = ?')
    .bind('verse_of_day')
    .first<{ value: string }>();

  const stats = await computeStats(c.env);
  await broadcast(c.env, 'stats', stats);
  await broadcast(c.env, 'new_checkin', { umadalpeName, membersCount });

  return c.json({
    success: true,
    id: result.meta.last_row_id,
    card: {
      umadalpeName,
      edificationWord,
      verse: verseRow?.value || '',
    },
  });
});

// ---------------------------------------------------------------
// PEDIDO DE ORAÇÃO
// ---------------------------------------------------------------
app.post('/api/prayer', async (c) => {
  const ip = getClientIp(c.req.raw);
  if (!(await rateLimit(c.env, ip, 'prayer', 10, 60))) {
    return c.json({ error: 'rate_limited' }, 429);
  }

  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: 'invalid_body' }, 400);

  const category = sanitize(body.category, 60);
  const description = sanitize(body.description, 500);
  const wantsPrayer = sanitizeBool(body.wantsPrayer);

  if (!PRAYER_CATEGORIES.includes(category as any) || !description) {
    return c.json({ error: 'validation', message: 'Categoria e descrição são obrigatórias.' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO prayer_requests (category, description, wants_prayer) VALUES (?, ?, ?)`
  )
    .bind(category, description, wantsPrayer ? 1 : 0)
    .run();

  const stats = await computeStats(c.env);
  await broadcast(c.env, 'stats', stats);

  return c.json({ success: true, message: 'Recebemos seu pedido. Nossa equipe de intercessão vai orar por você!' });
});

// ---------------------------------------------------------------
// FALE CONOSCO
// ---------------------------------------------------------------
app.post('/api/contact', async (c) => {
  const ip = getClientIp(c.req.raw);
  if (!(await rateLimit(c.env, ip, 'contact', 5, 60))) {
    return c.json({ error: 'rate_limited' }, 429);
  }

  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: 'invalid_body' }, 400);

  const name = sanitize(body.name, 120);
  if (!name) return c.json({ error: 'validation', message: 'Nome é obrigatório.' }, 400);

  await c.env.DB.prepare(
    `INSERT INTO contact_messages (quick_action, name, phone, message) VALUES (?, ?, ?, ?)`
  )
    .bind(sanitize(body.quickAction, 120), name, sanitize(body.phone, 30), sanitize(body.message, 1000))
    .run();

  return c.json({ success: true, message: 'Mensagem enviada! Em breve alguém da liderança vai te responder.' });
});

// ---------------------------------------------------------------
// MOSAICO DA ADORAÇÃO ("gratidão")
// ---------------------------------------------------------------
app.post('/api/mosaic/add', async (c) => {
  const ip = getClientIp(c.req.raw);
  if (!(await rateLimit(c.env, ip, 'mosaic', 5, 60))) {
    return c.json({ error: 'rate_limited' }, 429);
  }

  const body = await c.req.json().catch(() => null);
  const umadalpeName = sanitize(body?.umadalpeName, 120) || 'Anônimo';

  const countRow = await c.env.DB.prepare('SELECT COUNT(*) as n FROM mosaic_pixels').first<{ n: number }>();
  const slot = (countRow?.n || 0) + 1;
  const color = MOSAIC_COLORS[slot % MOSAIC_COLORS.length];

  await c.env.DB.prepare(
    `INSERT INTO mosaic_pixels (umadalpe_name, color, slot) VALUES (?, ?, ?)`
  )
    .bind(umadalpeName, color, slot)
    .run();

  await broadcast(c.env, 'mosaic_pixel', { umadalpeName, color, slot });
  const stats = await computeStats(c.env);
  await broadcast(c.env, 'stats', stats);

  return c.json({ success: true, slot, color });
});

app.get('/api/mosaic', async (c) => {
  const pixels = await c.env.DB.prepare(
    'SELECT umadalpe_name as umadalpeName, color, slot FROM mosaic_pixels ORDER BY slot ASC'
  ).all();
  return c.json({ pixels: pixels.results || [] });
});

// ---------------------------------------------------------------
// CONTEÚDO PÚBLICO: versículo, agenda, "conheça a UMADALPE"
// ---------------------------------------------------------------
app.get('/api/settings', async (c) => {
  const rows = await c.env.DB.prepare('SELECT key, value FROM settings').all<{ key: string; value: string }>();
  const map: Record<string, string> = {};
  for (const r of rows.results || []) map[r.key] = r.value;
  delete map.admin_token;
  return c.json(map);
});

app.get('/api/agenda', async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT id, title, event_date as eventDate, description FROM agenda_items ORDER BY event_date ASC'
  ).all();
  return c.json({ items: rows.results || [] });
});

// ---------------------------------------------------------------
// ESTATÍSTICAS EM TEMPO REAL (para TV)
// ---------------------------------------------------------------
async function computeStats(env: Env) {
  const caravansCount = await env.DB.prepare('SELECT COUNT(*) as n, SUM(members_count) as total FROM caravans').first<{
    n: number;
    total: number | null;
  }>();
  const prayersCount = await env.DB.prepare('SELECT COUNT(*) as n FROM prayer_requests').first<{ n: number }>();
  const mosaicCount = await env.DB.prepare('SELECT COUNT(*) as n FROM mosaic_pixels').first<{ n: number }>();

  return {
    umadalpesPresent: caravansCount?.n || 0,
    totalYoungConnected: caravansCount?.total || 0,
    prayerRequests: prayersCount?.n || 0,
    mosaicMarks: mosaicCount?.n || 0,
  };
}

app.get('/api/stats', async (c) => {
  return c.json(await computeStats(c.env));
});

// SSE stream (painel da TV escuta este endpoint)
app.get('/api/stream', async (c) => {
  const room = getRoom(c.env);
  return room.fetch('https://internal/stream');
});

// ---------------------------------------------------------------
// PAINEL ADMINISTRATIVO
// ---------------------------------------------------------------
app.post('/api/admin/login', async (c) => {
  const body = await c.req.json().catch(() => null);
  const token = sanitize(body?.token, 200);
  const row = await c.env.DB.prepare('SELECT value FROM settings WHERE key = ?')
    .bind('admin_token')
    .first<{ value: string }>();
  if (row?.value && row.value === token) {
    return c.json({ success: true });
  }
  return c.json({ error: 'invalid_credentials' }, 401);
});

app.use('/api/admin/*', async (c, next) => {
  if (c.req.path === '/api/admin/login') return next();
  if (!(await requireAdmin(c.req.raw, c.env))) {
    return c.json({ error: 'unauthorized' }, 401);
  }
  return next();
});

app.get('/api/admin/dashboard', async (c) => {
  const stats = await computeStats(c.env);
  const caravans = await c.env.DB.prepare(
    `SELECT id, umadalpe_name as umadalpeName, host_umadalpe as hostUmadalpe,
            has_dirigente as hasDirigente, has_vice_dirigente as hasViceDirigente,
            secretarias_count as secretariasCount, auxiliares_count as auxiliaresCount,
            maestros_count as maestrosCount, members_count as membersCount,
            edification_word as edificationWord, created_at as createdAt
     FROM caravans ORDER BY created_at DESC`
  ).all();

  return c.json({ stats, caravans: caravans.results || [] });
});

app.get('/api/admin/caravans/export', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT umadalpe_name, host_umadalpe, has_dirigente, has_vice_dirigente,
            secretarias_count, auxiliares_count, maestros_count, members_count,
            edification_word, created_at
     FROM caravans ORDER BY created_at ASC`
  ).all();

  const header = 'UMADALPE,Anfitriã,Dirigente,Vice Dirigente,Secretárias,Auxiliares,Maestros,Componentes,Palavra,Data\n';
  const csv =
    header +
    (rows.results || [])
      .map((r: any) =>
        [
          r.umadalpe_name,
          r.host_umadalpe,
          r.has_dirigente ? 'Sim' : 'Não',
          r.has_vice_dirigente ? 'Sim' : 'Não',
          r.secretarias_count,
          r.auxiliares_count,
          r.maestros_count,
          r.members_count,
          r.edification_word,
          r.created_at,
        ]
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="caravanas.csv"',
    },
  });
});

app.get('/api/admin/prayers', async (c) => {
  const category = c.req.query('category');
  let query = `SELECT id, category, description, wants_prayer as wantsPrayer, prayed, created_at as createdAt
               FROM prayer_requests`;
  const binds: string[] = [];
  if (category) {
    query += ' WHERE category = ?';
    binds.push(category);
  }
  query += ' ORDER BY created_at DESC';
  const rows = await c.env.DB.prepare(query).bind(...binds).all();
  return c.json({ items: rows.results || [] });
});

app.post('/api/admin/prayers/:id/prayed', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('UPDATE prayer_requests SET prayed = 1 WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

app.get('/api/admin/prayers/export', async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT category, description, wants_prayer, prayed, created_at FROM prayer_requests ORDER BY created_at ASC'
  ).all();
  const header = 'Categoria,Descrição,Deseja Oração,Orado,Data\n';
  const csv =
    header +
    (rows.results || [])
      .map((r: any) =>
        [r.category, r.description, r.wants_prayer ? 'Sim' : 'Não', r.prayed ? 'Sim' : 'Não', r.created_at]
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="pedidos-oracao.csv"',
    },
  });
});

app.post('/api/admin/settings', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.key) return c.json({ error: 'validation' }, 400);
  await c.env.DB.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  )
    .bind(sanitize(body.key, 60), sanitize(body.value, 2000))
    .run();
  await broadcast(c.env, 'settings_updated', { key: body.key, value: body.value });
  return c.json({ success: true });
});

app.post('/api/admin/words', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.word) return c.json({ error: 'validation' }, 400);
  await c.env.DB.prepare('INSERT INTO edification_words (word) VALUES (?)').bind(sanitize(body.word, 60)).run();
  return c.json({ success: true });
});

app.get('/api/admin/words', async (c) => {
  const rows = await c.env.DB.prepare('SELECT id, word FROM edification_words ORDER BY id ASC').all();
  return c.json({ items: rows.results || [] });
});

app.delete('/api/admin/words/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM edification_words WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ success: true });
});

app.post('/api/admin/agenda', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.title || !body?.eventDate) return c.json({ error: 'validation' }, 400);
  await c.env.DB.prepare('INSERT INTO agenda_items (title, event_date, description) VALUES (?, ?, ?)')
    .bind(sanitize(body.title, 200), sanitize(body.eventDate, 60), sanitize(body.description, 500))
    .run();
  return c.json({ success: true });
});

app.delete('/api/admin/agenda/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM agenda_items WHERE id = ?').bind(c.req.param('id')).run();
  return c.json({ success: true });
});

// Modo intercessão manual: destaca um pedido de oração específico na TV
app.post('/api/admin/intercession/activate', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.prayerId) return c.json({ error: 'validation' }, 400);
  const prayer = await c.env.DB.prepare(
    'SELECT id, category, description FROM prayer_requests WHERE id = ?'
  )
    .bind(body.prayerId)
    .first();
  await broadcast(c.env, 'intercession_mode', { active: true, prayer });
  return c.json({ success: true });
});

app.post('/api/admin/intercession/deactivate', async (c) => {
  await broadcast(c.env, 'intercession_mode', { active: false, prayer: null });
  return c.json({ success: true });
});

// Contador "estou orando agora" (chamado pela página pública em modo intercessão)
app.post('/api/intercession/praying', async (c) => {
  const count = await c.env.CACHE.get('interceding_count');
  const n = (count ? parseInt(count, 10) : 0) + 1;
  await c.env.CACHE.put('interceding_count', String(n), { expirationTtl: 3600 });
  await broadcast(c.env, 'interceding_count', { count: n });
  return c.json({ success: true, count: n });
});

app.get('/api/admin/contact-messages', async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT id, quick_action as quickAction, name, phone, message, created_at as createdAt FROM contact_messages ORDER BY created_at DESC'
  ).all();
  return c.json({ items: rows.results || [] });
});

app.notFound((c) => c.json({ error: 'not_found' }, 404));

export default app;
