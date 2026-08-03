-- ============================================================
-- Conecta UMADALPE — Schema D1 (SQLite)
-- ============================================================

-- Caravanas (check-in de visita)
CREATE TABLE IF NOT EXISTS caravans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  umadalpe_name TEXT NOT NULL,
  host_umadalpe TEXT NOT NULL DEFAULT 'Maranguape II Baixo',
  has_dirigente INTEGER NOT NULL DEFAULT 0,
  has_vice_dirigente INTEGER NOT NULL DEFAULT 0,
  secretarias_count INTEGER NOT NULL DEFAULT 0,
  auxiliares_count INTEGER NOT NULL DEFAULT 0,
  maestros_count INTEGER NOT NULL DEFAULT 0,
  members_count INTEGER NOT NULL,
  edification_word TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pedidos de oração
CREATE TABLE IF NOT EXISTS prayer_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  wants_prayer INTEGER NOT NULL DEFAULT 0,
  prayed INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Mensagens de "Fale Conosco"
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quick_action TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pixels do "Mosaico da Adoração" (gratidão/oração na TV)
CREATE TABLE IF NOT EXISTS mosaic_pixels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  umadalpe_name TEXT NOT NULL,
  color TEXT NOT NULL,
  slot INTEGER NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Configurações gerais (versículo do dia, tema do evento, modo manutenção, etc.)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Palavras de edificação (sorteadas no card digital do check-in)
CREATE TABLE IF NOT EXISTS edification_words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL
);

-- Agenda de eventos
CREATE TABLE IF NOT EXISTS agenda_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seeds iniciais
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('verse_of_day', 'Salmos 133:1 — "Oh! Quão bom e quão suave é que os irmãos vivam em união!"'),
  ('event_theme', 'Aniversário UMADALPE Maranguape II Baixo'),
  ('event_date', ''),
  ('maintenance_mode', 'false'),
  ('admin_token', 'troque-este-token-no-painel');

INSERT INTO edification_words (word) VALUES
  ('Renovo'), ('Fé'), ('Unidade'), ('Propósito'), ('Restauração'),
  ('Esperança'), ('Comunhão'), ('Avivamento'), ('Graça'), ('Perseverança');
