import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { chromeVersion } from '../build/version.mjs';

const script = await readFile(new URL('../cordwipe.user.js', import.meta.url), 'utf8');
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const AUTHOR = '111111111111111111';
const GUILD = '222222222222222222';
const CHANNEL = '333333333333333333';
let browser;
before(async () => { browser = await chromium.launch({ headless: true }); });
after(async () => { await browser?.close(); });

async function fixture(t, html = '') {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  t.after(() => context.close());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Every navigation and request is intercepted. No browser profile or Discord connection.
  await page.route('**/*', route => {
    if (route.request().isNavigationRequest() && route.request().url().startsWith('http://cordwipe.test/')) {
      return route.fulfill({ contentType: 'text/html', body: `<html><head><meta charset="utf-8"></head><body>${html}</body></html>` });
    }
    return route.abort('blockedbyclient');
  });
  await page.goto(`http://cordwipe.test/channels/${GUILD}/${CHANNEL}`);
  await page.evaluate(() => {
    window.calls = [];
    window.storageReads = [];
    const append = Node.prototype.appendChild;
    Node.prototype.appendChild = function(node) {
      const result = append.call(this, node);
      if (node.nodeName === 'IFRAME') {
        const proto = node.contentWindow.Storage.prototype;
        const get = proto.getItem;
        proto.getItem = function(key) {
          window.storageReads.push(key);
          return get.call(this, key);
        };
      }
      return result;
    };
    window.fetch = (...args) => {
      if (window.mockFetch) return window.mockFetch(...args);
      window.calls.push(args); throw new Error('Unmocked request');
    };
  });
  await page.addScriptTag({ content: script });
  t.after(() => assert.deepEqual(errors, []));
  return page;
}

async function open(page) { await page.locator('#cordwipe-btn').click(); }
async function fill(page) {
  await page.locator('#cordwipe #authorId').fill(AUTHOR);
  await page.locator('#cordwipe #guildId').fill(GUILD);
  await page.locator('#cordwipe #channelId').fill(CHANNEL);
  await page.evaluate(() => { localStorage.setItem('token', JSON.stringify('synthetic-credential')); });
}

test('userscript has CordWipe identity, retained license and only the project update feed', () => {
  const metadata = script.split('// ==/UserScript==')[0];
  assert.match(metadata, /@name\s+CordWipe\r?\n/);
  assert.match(metadata, /@namespace\s+https:\/\/github.com\/avizmarlon\/cordwipe/);
  assert.equal(metadata.match(/@version\s+(\S+)/)[1], chromeVersion(pkg.version));
  for (const key of ['updateURL', 'downloadURL']) {
    assert.equal(metadata.match(new RegExp(`@${key}\\s+(\\S+)`))[1], 'https://raw.githubusercontent.com/avizmarlon/cordwipe/main/cordwipe.user.js');
  }
  assert.doesNotMatch(metadata, /@contributionURL|@require/);
  assert.match(script, /Copyright \(c\) 2019-2025 Victornpb and contributors/);
  assert.match(script, /Derivatives must keep attribution comments/);
});

test('floating fallback is visible without app root; startup never reads credentials or fetches', async t => {
  const page = await fixture(t);
  assert.equal(await page.locator('#cordwipe-btn').isVisible(), true);
  assert.match(await page.locator('#cordwipe-btn').getAttribute('class'), /cordwipe-floating/);
  assert.equal(await page.locator('iframe').count(), 0);
  assert.deepEqual(await page.evaluate(() => window.calls), []);
  assert.deepEqual(await page.evaluate(() => window.storageReads), []);
  await open(page);
  assert.equal(await page.getByRole('dialog', { name: 'CordWipe' }).isVisible(), true);
  assert.doesNotMatch(await page.locator('#cordwipe').textContent(), /Undiscord|victornpb/);
  assert.equal(await page.locator('#cordwipe #token').count(), 0);
  assert.equal(await page.locator('iframe').count(), 0);
  assert.deepEqual(await page.evaluate(() => window.calls), []);
  assert.deepEqual(await page.evaluate(() => window.storageReads), []);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#cordwipe-btn').getAttribute('aria-expanded'), 'false');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#cordwipe-btn').getAttribute('aria-expanded'), 'true');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  assert.equal(await page.locator('#cordwipe-btn').getAttribute('aria-expanded'), 'false');
});

test('semantic, localized, hashed and legacy headers remount one launcher after navigation', async t => {
  const page = await fixture(t, '<div id="app-mount"><section aria-label="Channel header"><div role="toolbar" style="height:32px"></div></section></div>');
  assert.equal(await page.locator('[role="toolbar"] #cordwipe-btn').count(), 1);
  await page.addScriptTag({ content: script });
  assert.equal(await page.locator('#cordwipe').count(), 1);
  for (const header of [
    '<section aria-label="Cabeçalho do canal"><div role="toolbar" style="height:32px"></div></section>',
    '<section><div class="toolbar_a1b2c3" style="height:32px"></div></section>',
    '<div class="toolbar-legacy" style="height:32px"></div>',
    '',
  ]) {
    await page.locator('#app-mount').evaluate((el, value) => { el.innerHTML = value; }, header);
    await page.waitForFunction(() => document.querySelectorAll('#cordwipe-btn').length === 1 && document.querySelector('#cordwipe-btn').isConnected);
    assert.equal(await page.locator('#cordwipe-btn').isVisible(), true);
    assert.equal(await page.locator('#cordwipe').count(), 1);
  }
  // A hidden leftover header must not trap the launcher on an old route.
  await page.locator('#app-mount').evaluate(el => { el.innerHTML = '<section style="display:none"><div role="toolbar"></div></section>'; });
  await page.waitForFunction(() => document.querySelector('#cordwipe-btn').classList.contains('cordwipe-floating'));
});

test('panel and launcher recover if the app replaces the document body', async t => {
  const page = await fixture(t);
  await page.evaluate(() => { document.body.replaceWith(document.createElement('body')); });
  await page.waitForFunction(() => document.querySelector('#cordwipe-btn')?.isConnected && document.querySelector('#cordwipe')?.isConnected);
  await open(page);
  assert.equal(await page.locator('#cordwipe').isVisible(), true);
});

test('invalid pattern and conflicting intervals perform no API requests', async t => {
  const page = await fixture(t);
  await open(page);
  await fill(page);
  await page.locator('#cordwipe #pattern').evaluate(el => { el.value = '['; });
  await page.locator('#cordwipe #start').click();
  assert.match(await page.locator('#logArea').textContent(), /Invalid regular expression/);
  assert.deepEqual(await page.evaluate(() => window.calls), []);
  await page.locator('#cordwipe #pattern').evaluate(el => { el.value = ''; });
  await page.locator('#cordwipe #minId').evaluate(el => { el.value = '444444444444444444'; });
  await page.locator('#cordwipe #minDate').evaluate(el => { el.value = '2025-01-01T00:00'; });
  await page.locator('#cordwipe #start').click();
  assert.match(await page.locator('#logArea').textContent(), /either a message interval or a date interval/);
  assert.deepEqual(await page.evaluate(() => window.calls), []);
});

test('cancelling preview prevents DELETE, restores controls, and keeps synthetic content out of logs', async t => {
  const page = await fixture(t);
  await open(page);
  await fill(page);
  await page.evaluate(({ AUTHOR, CHANNEL }) => {
    window.mockFetch = async (url, options) => {
      window.calls.push({ url, method: options.method });
      const body = url.endsWith('/users/@me') ? { id: AUTHOR } : { total_results: 1, messages: [[{
        id: '444444444444444444', channel_id: CHANNEL, author: { id: AUTHOR },
        content: '<img src=x onerror="window.injected=true">synthetic secret', type: 0, hit: true,
      }]] };
      return new Response(JSON.stringify(body), { status: 200 });
    };
  }, { AUTHOR, CHANNEL });
  page.on('dialog', dialog => dialog.dismiss());
  await page.locator('#cordwipe #start').click();
  await page.waitForFunction(() => document.querySelector('#progressPercent').textContent.startsWith('stopped:'));
  assert.equal(await page.locator('#cordwipe #start').isEnabled(), true);
  assert.equal(await page.locator('#cordwipe #stop').isEnabled(), false);
  assert.equal(await page.locator('#cordwipe #token').count(), 0);
  assert.equal(await page.evaluate(() => window.calls.some(c => c.method === 'DELETE')), false);
  assert.doesNotMatch(await page.locator('#logArea').textContent(), /synthetic secret|synthetic-credential/);
  assert.equal(await page.evaluate(() => window.injected), undefined);
});

test('Stop cancels an in-flight request and a new run waits for cleanup', async t => {
  const page = await fixture(t);
  await open(page);
  await fill(page);
  await page.evaluate(() => {
    window.mockFetch = (url, options) => new Promise((resolve, reject) => {
      window.calls.push({ url, method: options.method });
      options.signal.addEventListener('abort', () => reject(new DOMException('Stopped', 'AbortError')), { once: true });
    });
  });
  await page.locator('#cordwipe #start').click();
  assert.equal(await page.locator('#cordwipe #authorId').isEnabled(), false);
  await page.locator('#cordwipe #stop').click();
  await page.waitForFunction(() => document.querySelector('#progressPercent').textContent.startsWith('stopped:'));
  assert.equal(await page.locator('#cordwipe #authorId').isEnabled(), true);
  assert.equal(await page.evaluate(() => window.calls.length), 1);
});

test('confirmed synthetic deletion completes through UI and counts only the matching author', async t => {
  const page = await fixture(t);
  await open(page);
  await fill(page);
  await page.locator('#cordwipe #searchDelay').evaluate(el => { el.value = '1000'; });
  await page.evaluate(({ AUTHOR, CHANNEL }) => {
    let pageCount = 0;
    window.mockFetch = async (url, options) => {
      window.calls.push({ url, method: options.method });
      if (options.method === 'DELETE') return new Response(null, { status: 204 });
      if (url.endsWith('/users/@me')) return Response.json({ id: AUTHOR });
      const messages = pageCount++ ? [] : [[
        { id: '444444444444444444', channel_id: CHANNEL, author: { id: AUTHOR }, content: 'fixture own', type: 19, hit: true },
        { id: '444444444444444443', channel_id: CHANNEL, author: { id: '999999999999999999' }, content: 'fixture other', type: 0, hit: true },
      ]];
      return Response.json({ total_results: 2, messages });
    };
  }, { AUTHOR, CHANNEL });
  page.on('dialog', dialog => dialog.accept());
  await page.locator('#cordwipe #start').click();
  await page.waitForFunction(() => document.querySelector('#progressPercent').textContent.startsWith('completed: 1 deleted'));
  const deleted = await page.evaluate(() => window.calls.filter(call => call.method === 'DELETE'));
  assert.equal(deleted.length, 1);
  assert.match(deleted[0].url, /444444444444444444$/);
  assert.equal(await page.locator('#cordwipe #start').isEnabled(), true);
  assert.equal(await page.locator('#cordwipe #token').count(), 0);
  assert.doesNotMatch(await page.locator('#logArea').textContent(), /fixture own|fixture other|synthetic-credential/);
});

test('missing session fails safely with useful guidance and no credential controls or requests', async t => {
  const page = await fixture(t);
  await open(page);
  await fill(page);
  await page.evaluate(() => localStorage.removeItem('token'));
  await page.locator('#cordwipe #start').click();
  assert.match(await page.locator('#logArea').textContent(), /Reload Discord and try again/);
  assert.match(await page.locator('#logArea').textContent(), /never copy or share your token/);
  assert.deepEqual(await page.evaluate(() => window.calls), []);
  assert.equal(await page.locator('#cordwipe #start').isEnabled(), true);
  assert.equal(await page.locator('#cordwipe #token, #cordwipe #getToken').count(), 0);
});

test('controls need no session checkbox; authorization is read only for a valid explicit search', async t => {
  const page = await fixture(t);
  await open(page);
  assert.equal(await page.locator('#logArea').textContent(), '');
  assert.equal(await page.locator('#cordwipe #dataConsent').count(), 0);
  assert.match(await page.locator('#accessInfo').textContent(), /session and message history locally/);
  assert.equal(await page.locator('#start').getAttribute('aria-describedby'), 'accessInfo');
  assert.equal(await page.getByRole('link', { name: 'Privacy policy' }).getAttribute('href'), 'https://github.com/avizmarlon/cordwipe/blob/main/PRIVACY.md');
  await page.evaluate(() => {
    localStorage.setItem('token', JSON.stringify('synthetic-credential'));
    localStorage.setItem('user_id_cache', JSON.stringify('111111111111111111'));
  });
  await page.locator('#cordwipe #getChannel').click();
  assert.equal(await page.locator('#cordwipe #channelId').inputValue(), CHANNEL);
  assert.equal(await page.locator('#cordwipe #guildId').inputValue(), GUILD);
  assert.deepEqual(await page.evaluate(() => window.storageReads), []);
  await page.locator('#cordwipe #getAuthor').click();
  assert.equal(await page.locator('#cordwipe #authorId').inputValue(), AUTHOR);
  assert.deepEqual(await page.evaluate(() => window.storageReads), ['user_id_cache']);
  await page.locator('#cordwipe #pattern').evaluate(el => { el.value = '['; });
  await page.locator('#cordwipe #start').click();
  assert.match(await page.locator('#logArea').textContent(), /Invalid regular expression/);
  assert.deepEqual(await page.evaluate(() => window.storageReads), ['user_id_cache']);
  assert.deepEqual(await page.evaluate(() => window.calls), []);
  await page.locator('#cordwipe #pattern').evaluate(el => { el.value = ''; });
  await page.evaluate(() => {
    window.mockFetch = async (url, options) => {
      window.calls.push({ method: options.method, authorization: options.headers.Authorization });
      return Response.json({ message: 'synthetic-credential must not appear in logs' }, { status: 401 });
    };
  });
  await page.locator('#cordwipe #start').click();
  await page.waitForFunction(() => document.querySelector('#progressPercent').textContent.startsWith('failed:'));
  assert.deepEqual(await page.evaluate(() => window.storageReads), ['user_id_cache', 'token']);
  assert.deepEqual(await page.evaluate(() => window.calls), [{ method: 'GET', authorization: 'synthetic-credential' }]);
  assert.match(await page.locator('#logArea').textContent(), /HTTP 401.*Reload Discord/);
  assert.doesNotMatch(await page.locator('#cordwipe').innerHTML(), /synthetic-credential/);
  assert.equal(await page.locator('#cordwipe #start').isEnabled(), true);
  assert.equal(await page.locator('iframe').count(), 0);
});

test('webpack fallback removes only its own chunk and does not dispatch beforeunload', async t => {
  const page = await fixture(t);
  await open(page);
  await fill(page);
  await page.evaluate(() => {
    localStorage.removeItem('token');
    window.beforeUnloadCount = 0;
    addEventListener('beforeunload', () => window.beforeUnloadCount++);
    const realChunk = [['real'], {}, () => {}];
    window.realChunk = realChunk;
    const chunks = window.webpackChunkdiscord_app = [];
    chunks.push = chunk => {
      Array.prototype.push.call(chunks, chunk);
      chunk[2]({ c: { fake: { exports: { getToken: () => 'synthetic-webpack' } } } });
      Array.prototype.push.call(chunks, realChunk);
    };
    window.mockFetch = async (url, options) => {
      window.calls.push({ method: options.method, authorization: options.headers.Authorization });
      return Response.json({}, { status: 401 });
    };
  });
  await page.locator('#cordwipe #start').click();
  await page.waitForFunction(() => document.querySelector('#progressPercent').textContent.startsWith('failed:'));
  assert.equal(await page.evaluate(() => window.calls[0].authorization), 'synthetic-webpack');
  assert.doesNotMatch(await page.locator('#cordwipe').innerHTML(), /synthetic-webpack/);
  assert.deepEqual(await page.evaluate(() => ({ count: window.webpackChunkdiscord_app.length, retained: window.webpackChunkdiscord_app[0] === window.realChunk, unload: window.beforeUnloadCount })), { count: 1, retained: true, unload: 0 });
});

test('synthetic desktop fixture produces inspectable UI evidence', async t => {
  const page = await fixture(t, '<div id="app-mount"><section aria-label="Channel header" style="background:#181920;padding:16px"><div role="toolbar" style="display:flex;justify-content:flex-end;height:32px"></div></section><main style="padding:32px;font:16px system-ui">Offline Discord-shaped fixture — no account or messages</main></div>');
  await open(page);
  await mkdir(new URL('../test-results/', import.meta.url), { recursive: true });
  await page.screenshot({ path: new URL('../test-results/interface.png', import.meta.url).pathname.replace(/^\/(\w:)/, '$1') });
  assert.equal(await page.locator('#cordwipe').isVisible(), true);
});
