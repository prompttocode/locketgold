CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  image BLOB NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS results_expiry ON results(expires_at);
CREATE TABLE IF NOT EXISTS diagnostic_events (
  id TEXT PRIMARY KEY,
  created_ms INTEGER NOT NULL,
  details TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS diagnostic_events_created ON diagnostic_events(created_ms);
CREATE TABLE IF NOT EXISTS ai_daily_usage (
  day TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0
);
