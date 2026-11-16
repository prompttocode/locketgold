CREATE TABLE IF NOT EXISTS diagnostic_events (
  id TEXT PRIMARY KEY,
  created_ms INTEGER NOT NULL,
  details TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS diagnostic_events_created ON diagnostic_events(created_ms);
