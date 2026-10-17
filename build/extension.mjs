// Build a minimal Chromium MV3 package from the same bundle as the userscript.
// No service worker, remote code, background tasks or additional extension APIs.
import { readFile, writeFile, copyFile, cp, mkdir, rm } from 'node:fs/promises';
import { chromeVersion } from './version.mjs';

const root = new URL('../', import.meta.url);
const output = new URL('../dist/extension/', import.meta.url);
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const manifest = JSON.parse(await readFile(new URL('extension/manifest.template.json', root), 'utf8'));
if (JSON.stringify(manifest.content_scripts[0].matches) !== JSON.stringify(pkg.userScript.match)) {
  throw new Error('Userscript and extension Discord origin allowlists have diverged.');
}
manifest.version = chromeVersion(pkg.version);
manifest.version_name = pkg.version;
const bundle = await readFile(new URL(pkg.main, root), 'utf8');
if (!bundle.startsWith('// ==UserScript==') || !bundle.includes('Copyright (c) 2019-2025 Victornpb')) {
  throw new Error('Missing built userscript or original author attribution.');
}
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await writeFile(new URL('manifest.json', output), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(new URL('content.js', output), bundle);
await copyFile(new URL('LICENSE', root), new URL('LICENSE', output));
await cp(new URL('extension/icons/', root), new URL('icons/', output), { recursive: true });
console.log('Built dist/extension/ (Chrome/Edge Manifest V3, no additional permissions)');
