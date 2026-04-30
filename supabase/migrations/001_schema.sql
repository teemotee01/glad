-- ═══════════════════════════════════════════════
-- NEXUS Platform — Initial Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- ── Designs ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS designs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL DEFAULT 'Untitled Design',
  category    TEXT NOT NULL DEFAULT 'shirt',
  color       TEXT NOT NULL DEFAULT '#C9A84C',
  measurements JSONB NOT NULL DEFAULT '{}',
  texture_url TEXT,
  ai_result   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX designs_user_idx ON designs(user_id);
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "designs_own" ON designs USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Reservations ─────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name         TEXT NOT NULL,
  email        TEXT,
  date         DATE NOT NULL,
  time         TIME NOT NULL DEFAULT '19:00',
  guests       INTEGER NOT NULL DEFAULT 2,
  table_number TEXT,
  requests     TEXT,
  status       TEXT NOT NULL DEFAULT 'confirmed',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX reservations_user_idx ON reservations(user_id);
CREATE INDEX reservations_date_idx ON reservations(date);
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservations_own" ON reservations USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Orders ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  items      JSONB NOT NULL DEFAULT '[]',
  total      NUMERIC NOT NULL DEFAULT 0,
  status     TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX orders_user_idx ON orders(user_id);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_own" ON orders USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── AI Activity Log ──────────────────────────────
CREATE TABLE IF NOT EXISTS ai_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type       TEXT NOT NULL,
  prompt     TEXT,
  preview    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ai_logs_user_idx ON ai_logs(user_id);
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_logs_own" ON ai_logs USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
