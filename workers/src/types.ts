export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  REALTIME: DurableObjectNamespace;
  CORS_ORIGIN: string;
}

export interface CaravanInput {
  umadalpeName: string;
  hostUmadalpe?: string;
  hasDirigente: boolean;
  hasViceDirigente: boolean;
  secretariasCount: number;
  auxiliaresCount: number;
  maestrosCount: number;
  membersCount: number;
}

export interface PrayerInput {
  category: string;
  description: string;
  wantsPrayer: boolean;
}

export interface ContactInput {
  quickAction?: string;
  name: string;
  phone?: string;
  message?: string;
}

export const PRAYER_CATEGORIES = [
  'Família',
  'Vida espiritual',
  'Estudos',
  'Trabalho',
  'Saúde',
  'Ministério',
  'Outro',
] as const;

export const MOSAIC_COLORS = [
  '#1e3a8a',
  '#2563eb',
  '#fbbf24',
  '#f59e0b',
  '#6366f1',
  '#0ea5e9',
];
