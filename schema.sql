CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  image BLOB NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS results_expiry ON results(expires_at);
