import assert from 'node:assert/strict';
import { readFile, mkdir, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

const repo = fileURLToPath(new URL('../', import.meta.url));
const extensionDir = path.join(repo, 'dist', 'extension');
const screenshotDir = path.join(repo, 'images', 'store', 'screenshots');
const fixturePath = path.join(repo, 'test', 'fixtures', 'store-conversation.html');
const outputNames = ['01-launcher.png', '02-filter-configuration.png', '03-operation-progress.png'];
const AUTH = '10000000000000001';
const GUILD = '20000000000000002';
const CHANNEL = '30000000000000003';
const MESSAGE_A = '40000000000000004';
const MESSAGE_B = '40000000000000005';
const TEST_TOKEN = 'cordwipe-synthetic-test-credential';
const SAMPLE_MESSAGE = 'Weekly recap — fictional test message with https://commonroom.example and a sample PDF';

function pngHeader(buffer) {
  assert.equal(buffer.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Screenshot must be PNG');
  assert.equal(buffer.subarray(12, 16).toString('ascii'), 'IHDR', 'PNG must have an IHDR header');
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType: buffer[25],
  };
}

async function main() {
  const manifest = JSON.parse(await readFile(path.join(extensionDir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, 'CordWipe', 'Capture must use the built CordWipe MV3 extension');
  assert.match(manifest.version_name, /^0\.1\.0-dev\./, 'Capture should identify the development build');
  const fixture = await readFile(fixturePath, 'utf8');
  await mkdir(screenshotDir, { recursive: true });

  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    args: [`--disable-extensions-except=${extensionDir}`, `--load-extension=${extensionDir}`],
  });
  const unexpected = [];
  const apiCalls = [];
  const pageErrors = [];
  let searchCount = 0;
  let deleteCount = 0;
  let resolveSecondDelete;
  let resolveRelease;
  const secondDeleteStarted = new Promise(resolve => { resolveSecondDelete = resolve; });
  const secondDeleteGate = new Promise(resolve => { resolveRelease = resolve; });
  let releaseSecondDelete = false;

  try {
    await context.route('**/*', async route => {
      const request = route.request();
      const url = request.url();
      const parsed = new URL(url);
      if (parsed.origin === 'https://discord.com' && parsed.pathname.startsWith('/channels/')) {
        return route.fulfill({
          status: 200,
          contentType: 'text/html; charset=utf-8',
          headers: { 'content-security-policy': 'default-src \'self\'; script-src \'self\'; style-src \'unsafe-inline\' \'self\'; img-src \'self\' data:' },
          body: fixture,
        });
      }
      if (parsed.origin === 'https://discord.com' && parsed.pathname.startsWith('/api/v9/')) {
        const method = request.method();
        apiCalls.push(`${method} ${parsed.pathname}`);
        if (method === 'GET' && parsed.pathname === '/api/v9/users/@me') {
          return route.fulfill({ json: { id: AUTH } });
        }
        if (method === 'GET' && parsed.pathname === `/api/v9/guilds/${GUILD}/messages/search`) {
          searchCount++;
          if (searchCount === 1) {
            const hit = id => ({ id, guild_id: GUILD, channel_id: CHANNEL,
              author: { id: AUTH }, content: SAMPLE_MESSAGE, attachments: [{ id: 'synthetic-file' }],
              embeds: [], type: 0, pinned: false, hit: true });
            return route.fulfill({ json: { total_results: 2, messages: [[hit(MESSAGE_B), hit(MESSAGE_A)]] } });
          }
          return route.fulfill({ json: { total_results: 0, messages: [] } });
        }
        if (method === 'DELETE' && parsed.pathname.startsWith(`/api/v9/channels/${CHANNEL}/messages/`)) {
          deleteCount++;
          if (deleteCount === 1) return route.fulfill({ status: 204, body: '' });
          resolveSecondDelete();
          await secondDeleteGate;
          return route.fulfill({ status: 204, body: '' });
        }
      }
      unexpected.push(`${request.method()} ${url}`);
      return route.abort('blockedbyclient');
    });

    const page = await context.newPage();
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`https://discord.com/channels/${GUILD}/${CHANNEL}`, { waitUntil: 'domcontentloaded' });
    const launcher = page.locator('#cordwipe-btn');
    await launcher.waitFor({ state: 'visible', timeout: 15000 });
    assert.equal(await launcher.count(), 1, 'Exactly one real CordWipe launcher should be mounted');
    assert.equal(await page.locator('#cordwipe').count(), 1, 'Built extension panel should be mounted');
    assert.equal(await page.locator('#cordwipe').isVisible(), false, 'Launcher capture must show the closed panel');
    assert.equal(apiCalls.length, 0, 'Installing and opening the page must not call the API');
    await page.screenshot({ path: path.join(screenshotDir, outputNames[0]), animations: 'disabled' });

    await launcher.click();
    const panel = page.locator('#cordwipe');
    await panel.waitFor({ state: 'visible' });
    assert.match(await panel.textContent(), /CordWipe/);
    assert.doesNotMatch(await panel.textContent(), /Undiscord|victornpb/);

    await page.locator('#authorId').fill(AUTH);
    await page.locator('#guildId').fill(GUILD);
    await page.locator('#channelId').fill(CHANNEL);
    await page.locator('#redact').uncheck();
    await page.locator('#cordwipe details').first().locator('summary').click();
    const filter = page.locator('#cordwipe details').nth(1);
    await filter.locator('summary').click();
    await page.locator('#search').fill('Weekly recap');
    await page.locator('#hasLink').check();
    await page.locator('#hasFile').check();
    await page.locator('#pattern').fill('^Weekly recap');
    await page.screenshot({ path: path.join(screenshotDir, outputNames[1]), animations: 'disabled' });

    await page.evaluate(token => localStorage.setItem('token', JSON.stringify(token)), TEST_TOKEN);
    for (const id of ['searchDelay', 'deleteDelay']) {
      await page.locator(`#${id}`).evaluate(input => {
        input.value = '1000';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
    const confirmationMessages = [];
    page.on('dialog', async dialog => {
      confirmationMessages.push(dialog.message());
      assert.match(dialog.message(), /Permanently delete your matching messages/);
      assert.match(dialog.message(), new RegExp(CHANNEL));
      assert.match(dialog.message(), /Weekly recap/);
      await dialog.accept();
    });

    await page.locator('#start').click();
    let secondDeleteTimeout;
    await Promise.race([
      secondDeleteStarted,
      new Promise((_, reject) => { secondDeleteTimeout = setTimeout(() => reject(new Error('Synthetic second DELETE did not start')), 20000); }),
    ]).finally(() => clearTimeout(secondDeleteTimeout));
    await page.waitForFunction(() => document.querySelector('#progressPercent')?.textContent?.includes('deleted: 1'), undefined, { timeout: 10000 });
    assert.equal(confirmationMessages.length, 1, 'One native confirmation must be accepted for synthetic messages only');
    assert.equal(deleteCount, 2, 'Both DELETE requests must be intercepted synthetic calls');
    assert.deepEqual(apiCalls.filter(call => call.startsWith('DELETE')), [
      `DELETE /api/v9/channels/${CHANNEL}/messages/${MESSAGE_B}`,
      `DELETE /api/v9/channels/${CHANNEL}/messages/${MESSAGE_A}`,
    ]);
    const liveCounts = await page.locator('#progressPercent').textContent();
    assert.match(liveCounts, /Scanned: 2; deleted: 1; already absent: 0; failed: 0/);
    const logText = await page.locator('#logArea').textContent();
    assert.ok(!logText.includes(TEST_TOKEN), 'Synthetic credential must not enter extension logs');
    assert.ok(!logText.includes(SAMPLE_MESSAGE), 'Synthetic message text must not enter extension logs');
    assert.ok(!(await page.locator('body').innerText()).includes(TEST_TOKEN), 'Synthetic credential must not be rendered in the page');
    await page.screenshot({ path: path.join(screenshotDir, outputNames[2]), animations: 'disabled' });

    releaseSecondDelete = true;
    resolveRelease();
    await page.waitForFunction(
      () => document.querySelector('#progressPercent')?.textContent?.startsWith('completed: 2 deleted'),
      undefined,
      { timeout: 15000 },
    );
    assert.equal(await page.locator('#token').count(), 0, 'The extension must not render a token field');
    assert.doesNotMatch(await page.locator('#logArea').textContent(), new RegExp(TEST_TOKEN));
    assert.deepEqual(pageErrors, [], 'No browser page errors during capture');
    assert.deepEqual(unexpected, [], 'All routes were intercepted and no unexpected external request was made');
    assert.equal(searchCount, 2, 'The synthetic operation searched once and verified the end of results');
    assert.equal(deleteCount, 2, 'Only the two synthetic messages were deleted');

    const files = (await readdir(screenshotDir)).filter(name => name.endsWith('.png')).sort();
    assert.deepEqual(files, [...outputNames].sort(), 'Store screenshot folder must contain exactly the three requested PNGs');
    for (const name of outputNames) {
      const file = path.join(screenshotDir, name);
      const dimensions = pngHeader(await readFile(file));
      assert.deepEqual(dimensions, { width: 1280, height: 800, colorType: 2 }, `${name} must be 1280x800 RGB with no alpha channel`);
      assert.ok((await stat(file)).size > 10_000, `${name} should contain the full rendered interface`);
    }
    console.log(`Captured ${outputNames.length} synthetic CordWipe MV3 screenshots at 1280x800 RGB: ${outputNames.join(', ')}`);
  } finally {
    if (!releaseSecondDelete) resolveRelease();
    await context.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
