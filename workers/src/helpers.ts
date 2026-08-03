import type { Env } from './types';

/** Rate limit público: N requisições por janela de tempo, por IP + rota. */
export async function rateLimit(
  env: Env,
  ip: string,
  route: string,
  limit = 10,
  windowSeconds = 60
): Promise<boolean> {
  const key = `rl:${route}:${ip}`;
  const current = await env.CACHE.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= limit) return false;

  await env.CACHE.put(key, String(count + 1), { expirationTtl: windowSeconds });
  return true;
}

/** Remove tags HTML e caracteres perigosos de strings enviadas pelo público. */
export function sanitize(input: unknown, maxLen = 1000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

export function sanitizeBool(input: unknown): boolean {
  return input === true || input === 'true' || input === 1 || input === '1';
}

export function sanitizeInt(input: unknown, min = 0, max = 100000): number {
  const n = parseInt(String(input), 10);
  if (Number.isNaN(n)) return 0;
  return Math.min(Math.max(n, min), max);
}

export function json(data: unknown, status = 200, origin = '*'): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
    },
  });
}

export function getClientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

/** Verifica o token de admin enviado no header Authorization: Bearer <token>. */
export async function requireAdmin(request: Request, env: Env): Promise<boolean> {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return false;

  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?')
    .bind('admin_token')
    .first<{ value: string }>();

  return !!row && row.value === token;
}
