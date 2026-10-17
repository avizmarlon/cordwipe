// Create a standalone ZIP with manifest.json at its root (not a nested folder).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { zipSync } from 'fflate';

const root = new URL('../', import.meta.url);
const dir = new URL('../dist/extension/', import.meta.url);
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const paths = ['manifest.json', 'content.js', 'LICENSE', 'icons/icon16.png', 'icons/icon48.png', 'icons/icon128.png'];
const entries = {};
for (const path of paths) {
  const bytes = new Uint8Array(await readFile(new URL(path, dir)));
  entries[path] = [bytes, { mtime: new Date('2000-01-01T00:00:00.000Z') }];
}
const archive = zipSync(entries, { level: 6 });
const destination = new URL('../dist/', import.meta.url);
await mkdir(destination, { recursive: true });
const name = `cordwipe-extension-v${pkg.version}.zip`;
await writeFile(new URL(name, destination), archive);
console.log(`Packed dist/${name} (SHA256: ${createHash('sha256').update(archive).digest('hex')})`);
