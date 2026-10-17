import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { unzipSync } from 'fflate';
import { chromium } from 'playwright';
import { chromeVersion } from '../build/version.mjs';

const root = new URL('../', import.meta.url);
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const extensionDir = fileURLToPath(new URL('dist/extension/', root));
const files = ['manifest.json', 'content.js', 'LICENSE',
  'icons/icon16.png', 'icons/icon48.png', 'icons/icon128.png'];
const manifest = JSON.parse(await readFile(new URL('dist/extension/manifest.json', root), 'utf8'));
const AUTHOR = '111111111111111111';
const OTHER = '222222222222222222';
const CHANNEL = '333333333333333333';
const MESSAGE = '444444444444444444';
const OTHER_MESSAGE = '443333333333333333';

test('MV3 manifest only targets Discord and requests no privileged extension APIs', async () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.minimum_chrome_version, '111');
  assert.equal(manifest.version, chromeVersion(pkg.version));
  assert.equal(manifest.version_name, pkg.version);
  assert.equal(manifest.content_scripts.length, 1);
  assert.deepEqual(manifest.content_scripts[0].matches, pkg.userScript.match);
  assert.equal(manifest.content_scripts[0].world, 'MAIN');
  assert.equal(manifest.content_scripts[0].run_at, 'document_idle');
  assert.deepEqual(manifest.content_scripts[0].js, ['content.js']);
  assert.ok(!manifest.permissions?.length);
  assert.ok(!manifest.host_permissions?.length);
  assert.ok(!manifest.background);
  assert.ok(!manifest.externally_connectable);
  const bundle = await readFile(new URL('dist/extension/content.js', root), 'utf8');
  const userscript = await readFile(new URL('cordwipe.user.js', root), 'utf8');
  assert.equal(bundle, userscript, 'Extension and userscript must share the same compiled logic');
  assert.match(bundle, /Copyright \(c\) 2019-2025 Victornpb and contributors/);
});

test('ZIP installs from its root and contains exactly the built local assets', async () => {
  const archive = unzipSync(new Uint8Array(await readFile(new URL(`dist/cordwipe-extension-v${pkg.version}.zip`, root))));
  assert.deepEqual(Object.keys(archive).sort(), files.slice().sort());
  for (const path of files) {
    const expected = await readFile(new URL(`dist/extension/${path}`, root));
    assert.deepEqual(Buffer.from(archive[path]), expected, path);
  }
});

test('installed MV3 extension handles SPA entry and deletes only consented synthetic matching messages', async t => {
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 900 },
    args: [
      `--disable-extensions-except=${extensionDir}`,
      `--load-extension=${extensionDir}`,
    ],
  });
  t.after(async () => { await context.close(); });

  const seen = [];
  const deletes = [];
  const unexpected = [];
  let historyPages = 0;
  await context.route('**/*', route => {
    const req = route.request();
    const url = req.url();
    const u = new URL(url);
    if (u.origin === 'https://discord.com' && (u.pathname.startsWith('/channels/') || u.pathname === '/app')) {
      return route.fulfill({
        contentType: 'text/html',
        headers: { 'content-security-policy': 'default-src \'self\'; script-src \'self\'; style-src \'unsafe-inline\' \'self\'; img-src \'self\' data:' },
        body: '<!doctype html><html><head><title>Offline CordWipe extension fixture</title></head><body>' +
          '<div id="app-mount"><section aria-label="Channel header">' +
          '<div role="toolbar" style="height:48px;width:500px"></div></section></div></body></html>',
      });
    }
    if (u.origin === 'https://discord.com' && u.pathname.startsWith('/api/v9/')) {
      const method = req.method();
      seen.push(method + ' ' + u.pathname);
      if (method === 'GET' && u.pathname === '/api/v9/users/@me') {
        return route.fulfill({ json: { id: AUTHOR } });
      }
      if (method === 'GET' && u.pathname === `/api/v9/channels/${CHANNEL}`) {
        return route.fulfill({ json: { id: CHANNEL, type: 1 } });
      }
      if (method === 'GET' && u.pathname === `/api/v9/channels/${CHANNEL}/messages`) {
        historyPages++;
        return route.fulfill({ json: historyPages === 1 ? [
          { id: MESSAGE, channel_id: CHANNEL, author: { id: AUTHOR }, content: 'synthetic test message', type: 0 },
          { id: OTHER_MESSAGE, channel_id: CHANNEL, author: { id: OTHER }, content: 'other simulated person', type: 0 },
        ] : [] });
      }
      if (method === 'DELETE' && u.pathname === `/api/v9/channels/${CHANNEL}/messages/${MESSAGE}`) {
        deletes.push(u.pathname);
        return route.fulfill({ status: 204, body: '' });
      }
    }
    unexpected.push(req.method() + ' ' + url);
    return route.abort('blockedbyclient');
  });

  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('https://discord.com/app', { waitUntil: 'load' });
  assert.equal(await page.locator('#cordwipe-btn').count(), 0);
  assert.equal(seen.length, 0);
  await page.evaluate(channel => {
    history.pushState({}, '', `/channels/@me/${channel}`);
    document.querySelector('#app-mount').appendChild(document.createElement('main'));
  }, CHANNEL);
  await page.locator('#cordwipe-btn').waitFor({ state: 'visible', timeout: 15000 });
  assert.equal(await page.locator('#cordwipe-btn').count(), 1);
  assert.equal(seen.length, 0, 'Extension initialization must never call the Discord API');
  await page.locator('#cordwipe-btn').click();
  assert.equal(await page.locator('#cordwipe').isVisible(), true);
  assert.doesNotMatch(await page.locator('#cordwipe').textContent(), /Undiscord|victornpb/);
  assert.equal(await page.locator('#cordwipe #token').count(), 0);

  // With a session available, Delete still cannot read it or call APIs before consent.
  await page.evaluate(() => { localStorage.setItem('token', JSON.stringify('synthetic-credential')); });
  await page.locator('#cordwipe #start').click();
  assert.equal(seen.length, 0);
  await page.locator('#cordwipe #dataConsent').check();

  await page.locator('#cordwipe #authorId').fill(AUTHOR);
  await page.locator('#cordwipe #guildId').fill('@me');
  await page.locator('#cordwipe #channelId').fill(CHANNEL);
  for (const id of ['searchDelay', 'deleteDelay']) {
    await page.locator(`#cordwipe #${id}`).evaluate(input => {
      input.value = '1000';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  const previews = [];
  page.on('dialog', dialog => {
    previews.push(dialog.message());
    return dialog.accept();
  });
  await page.locator('#cordwipe #start').click();
  await page.waitForFunction(
    () => document.querySelector('#progressPercent')?.textContent?.startsWith('completed: 1 deleted'),
    undefined,
    { timeout: 15000 },
  );
  assert.equal(previews.length, 1);
  assert.deepEqual(deletes, [`/api/v9/channels/${CHANNEL}/messages/${MESSAGE}`]);
  assert.ok(seen.some(value => value.endsWith('/users/@me')));
  assert.equal(await page.locator('#cordwipe #token').count(), 0);
  assert.match(await page.locator('#progressPercent').textContent(), /already absent.*failed.*skipped/);
  assert.doesNotMatch(await page.locator('#logArea').textContent(), /synthetic-credential|synthetic test message/);
  assert.deepEqual(unexpected, [], 'No external requests or unexpected API routes');
  assert.deepEqual(pageErrors, []);
});
