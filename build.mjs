import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
const root = new URL('./', import.meta.url);
const source = new URL('./public/', root);
const out = new URL('./dist/', root);
await build({ entryPoints:[fileURLToPath(new URL('./src/album/index.jsx', root))], outfile:fileURLToPath(new URL('./public/album.js', root)), bundle:true, minify:true, format:'iife', target:'es2022', define:{ 'process.env.NODE_ENV':'"production"' }, legalComments:'eof', banner:{ js:'/* Generated from src/album/index.jsx by npm run build. Edit src/album/, not this file. */' } });
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'styles.css', 'experience.css', 'garden.css', 'script.js', 'garden.js', 'bouquet.js', 'flower-profiles.js', 'favicon.svg', 'html2canvas.min.js', 'fonts', 'nhac', 'admin.html', 'admin.css', 'admin.js', 'album.css', 'album.js', 'album-data.js', 'photos', 'interactions.css', 'effects.js', 'paper-grain.png']) {
  await cp(new URL(file, source), new URL(file, out), { recursive: true });
}
console.log(`Built static assets: ${fileURLToPath(out)}`);
