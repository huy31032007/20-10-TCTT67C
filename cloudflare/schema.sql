CREATE TABLE IF NOT EXISTS garden_state (
  id TEXT PRIMARY KEY CHECK (id = 'class'),
  revision INTEGER NOT NULL,
  payload TEXT NOT NULL
);
