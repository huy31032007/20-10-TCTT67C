// All visitors use the same row. A conditional SQL write preserves concurrent joins.
export function createD1Store(database) {
  // Start each request at the primary so polling cannot return a stale replica.
  const db = database.withSession('first-primary');
  return {
    async read() {
      const row = await db.prepare(
        "SELECT revision, payload FROM garden_state WHERE id = 'class'"
      ).first();
      return row ? { data: JSON.parse(row.payload), etag: String(row.revision) } : null;
    },
    async write(data, etag) {
      const payload = JSON.stringify(data);
      const result = etag === null
        ? await db.prepare(
            "INSERT OR IGNORE INTO garden_state (id, revision, payload) VALUES ('class', ?, ?)"
          ).bind(data.revision, payload).run()
        : await db.prepare(
            "UPDATE garden_state SET revision = ?, payload = ? WHERE id = 'class' AND revision = ?"
          ).bind(data.revision, payload, Number(etag)).run();
      return result.meta.changes === 1;
    }
  };
}
