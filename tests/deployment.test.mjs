import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
function files(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const name = prefix + entry.name;
    return entry.isDirectory() ? files(join(directory, entry.name), `${name}/`) : [name];
  });
}

test('build preserves all frontend files and excludes backend code and configuration', () => {
  execFileSync(process.execPath, ['build.mjs'], { cwd: root, stdio: 'pipe' });
  const expected = files(join(root, 'public')).sort();
  const actual = files(join(root, 'dist')).sort();
  assert.deepEqual(actual, expected);
  for (const name of expected) {
    assert.deepEqual(readFileSync(join(root, 'dist', name)), readFileSync(join(root, 'public', name)));
  }
  for (const path of ['server', 'cloudflare', 'node_modules', 'wrangler.jsonc', '.env', 'package.json']) {
    assert.equal(existsSync(join(root, 'dist', path)), false);
  }
  const html = readFileSync(join(root, 'dist/index.html'), 'utf8');
  for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (!url.startsWith('#') && !/^(https?:|data:)/.test(url)) {
      assert(existsSync(join(root, 'dist', url)), `Missing frontend resource: ${url}`);
    }
  }
});

test('production and preview use separate D1 databases with only dist exposed as assets', () => {
  const production = JSON.parse(readFileSync(join(root, 'wrangler.jsonc'), 'utf8'));
  const preview = JSON.parse(readFileSync(join(root, 'wrangler.preview.jsonc'), 'utf8'));
  assert.notEqual(production.name, preview.name);
  assert.notEqual(production.d1_databases[0].database_id, preview.d1_databases[0].database_id);
  for (const config of [production, preview]) {
    assert.equal(config.assets.directory, './dist');
    assert.deepEqual(config.assets.run_worker_first, ['/api/*']);
    assert.equal(config.d1_databases[0].binding, 'GARDEN_DB');
    assert(existsSync(join(root, config.main)));
    assert.equal(config.env, undefined);
  }
});
