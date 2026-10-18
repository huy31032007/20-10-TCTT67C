import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('./', import.meta.url);
const source = new URL('./public/', root);
const out = new URL('./dist/', root);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'styles.css', 'experience.css', 'garden.css', 'script.js', 'garden.js', 'bouquet.js', 'flower-profiles.js', 'favicon.svg', 'html2canvas.min.js', 'fonts', 'nhac', 'admin.html', 'admin.css', 'admin.js']) {
  await cp(new URL(file, source), new URL(file, out), { recursive: true });
}
console.log(`Built static assets: ${fileURLToPath(out)}`);
