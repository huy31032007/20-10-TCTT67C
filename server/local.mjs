import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, rename, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, extname, dirname } from 'node:path';
import { Readable } from 'node:stream';
import { createGardenHandler } from './garden-handler.mjs';
import { createLetterHandler } from './letter-handler.mjs';
import { createReactionHandler } from './reaction-handler.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicRoot = resolve(root, 'public');
const dataFile = resolve(process.env.GARDEN_DATA_DIR || resolve(root, 'data'), 'garden.json');
let writes = Promise.resolve();
async function read() {
  try {
    const raw = await readFile(dataFile, 'utf8');
    return { data: JSON.parse(raw), etag: createHash('sha256').update(raw).digest('hex') };
  } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
const store = { read, write(data, expected) {
  const operation = writes.then(async () => {
    const current = await read();
    if ((current?.etag || null) !== expected) return false;
    await mkdir(dirname(dataFile), { recursive: true });
    const temp = `${dataFile}.tmp`;
    await writeFile(temp, JSON.stringify(data), { mode: 0o600 });
    await rename(temp, dataFile);
    return true;
  });
  writes = operation.catch(() => {});
  return operation;
} };
const garden = createGardenHandler(store);
const letter = createLetterHandler();
const reactions = createReactionHandler(store);
const admin = createGardenHandler(store, { adminOnly: true, adminToken: process.env.GARDEN_ADMIN_TOKEN });
const staticFiles = new Set(['index.html', 'styles.css', 'experience.css', 'garden.css', 'script.js', 'personalization.js', 'garden.js', 'bouquet.js', 'flower-profiles.js', 'favicon.svg', 'html2canvas.min.js', 'admin.html', 'admin.css', 'admin.js', 'album.css', 'album.js', 'album-data.js', 'interactions.css', 'ticket.css', 'effects.js', 'paper-grain.png']);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.txt': 'text/plain' };
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 2010);
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname === '/api/garden' || url.pathname === '/api/admin/garden' || url.pathname === '/api/letter' || url.pathname === '/api/reactions') {
      const request = new Request(url, { method: req.method, headers: req.headers, ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body: Readable.toWeb(req), duplex: 'half' } : {}) });
      const result = await (url.pathname === '/api/reactions' ? reactions : url.pathname === '/api/letter' ? letter : url.pathname === '/api/admin/garden' ? admin : garden)(request);
      res.writeHead(result.status, Object.fromEntries(result.headers));
      res.end(Buffer.from(await result.arrayBuffer()));
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
    const path = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    if (!staticFiles.has(path) && !/^(fonts|nhac|photos)\/[a-zA-Z0-9_.-]+$/.test(path)) { res.writeHead(404); res.end('Not found'); return; }
    const target = resolve(publicRoot, path);
    if (!(await stat(target)).isFile()) throw Object.assign(new Error(), { code: 'ENOENT' });
    const bytes = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Content-Length': bytes.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 500); res.end('Request failed'); }
});
server.listen(port, host, () => console.log(`Local preview: http://${host}:${server.address().port}`));
