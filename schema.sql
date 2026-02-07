DROP TABLE IF EXISTS clips;
CREATE TABLE clips (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  note TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_clips_created_at ON clips(created_at DESC);