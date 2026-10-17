// Export the owner-review artwork at the store's exact dimensions. No personal profile.
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../images/store/', import.meta.url));
const names = ['a-chat-bin', 'b-bubble-trash', 'c-erase-message', 'd-stack-delete'];
const browser = await chromium.launch({ headless: true });
try {
  await mkdir(path.join(root, 'promo'), { recursive: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1 });
  await context.route('**/*', route => route.request().url().startsWith('file:') ? route.continue() : route.abort('blockedbyclient'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const entry = pathToFileURL(path.join(root, 'index.html')).href;
  for (const name of names) {
    for (const size of [512, 128, 48, 16]) {
      const png = await readFile(path.join(root, 'icons', `${name}${size === 512 ? '' : `-${size}`}.png`));
      assert.equal(png.readUInt32BE(16), size);
      assert.equal(png.readUInt32BE(20), size);
      assert.equal(png[25], 6, 'Icons must have a real alpha channel');
    }
    await page.setViewportSize({ width: 440, height: 280 });
    await page.goto(`${entry}?tile=${name[0]}`);
    await page.locator('.tile img').evaluate(img => img.decode());
    const source = await readFile(path.join(root, 'icons', `${name}.png`));
    const cornerAlpha = await page.evaluate(async data => {
      const img = new Image();
      img.src = `data:image/png;base64,${data}`;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return ctx.getImageData(0, 0, 1, 1).data[3];
    }, source.toString('base64'));
    assert.equal(cornerAlpha, 0, 'Icon canvas corner must be transparent');
    const output = path.join(root, 'promo', `${name}-440x280.png`);
    await page.screenshot({ path: output });
    const png = await readFile(output);
    assert.equal(png.readUInt32BE(16), 440);
    assert.equal(png.readUInt32BE(20), 280);
    assert.equal(png[25], 2, 'Promo tiles must be RGB without alpha');
  }
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto(entry);
  await page.locator('img[src]').evaluateAll(imgs => Promise.all(imgs.map(img => img.decode())));
  const box = await page.locator('#icon-options').boundingBox();
  await page.screenshot({ path: path.join(root, 'icon-comparison.png'), clip: { x: 0, y: 0, width: 1280, height: Math.ceil(box.y + box.height + 24) } });
  await page.locator('.promos').screenshot({ path: path.join(root, 'promo-comparison.png') });
  const bannerRoot = path.join(root, 'banners', '2026-10-17');
  for (const size of [16, 48, 128]) {
    const approved = await readFile(path.join(root, 'icons', `approved-chat-bin-${size}.png`));
    assert.equal(approved.readUInt32BE(16), size);
    assert.equal(approved.readUInt32BE(20), size);
    assert.equal(approved[25], 6, 'Approved package icons must retain transparency');
    assert.deepEqual(await readFile(new URL(`../extension/icons/icon${size}.png`, import.meta.url)), approved);
  }
  const bannerManifest = JSON.parse(await readFile(path.join(bannerRoot, 'prompts.json'), 'utf8'));
  for (const { id } of bannerManifest.concepts) {
    for (const [width, height, file] of [
      [440, 280, `${id}-440x280.png`],
      [1540, 980, `sources/${id}-1540x980.png`],
    ]) {
      const png = await readFile(path.join(bannerRoot, file));
      assert.equal(png.readUInt32BE(16), width, `${file} width`);
      assert.equal(png.readUInt32BE(20), height, `${file} height`);
      assert.equal(png[25], 2, `${file} must be RGB without alpha`);
    }
  }
  for (const [width, height, file] of [
    [440, 280, path.join(bannerRoot, bannerManifest.alternative_wordmark.tile)],
    [1540, 980, path.join(bannerRoot, bannerManifest.alternative_wordmark.source)],
    [880, 560, path.join(root, '..', 'cordwipe-banner.png')],
  ]) {
    const png = await readFile(file);
    assert.equal(png.readUInt32BE(16), width, `${file} width`);
    assert.equal(png.readUInt32BE(20), height, `${file} height`);
    assert.equal(png[25], 2, `${file} must be RGB without alpha`);
  }
  await page.setViewportSize({ width: 1000, height: 1500 });
  await page.goto(pathToFileURL(path.join(bannerRoot, 'index.html')).href);
  await page.locator('img').evaluateAll(imgs => Promise.all(imgs.map(img => img.decode())));
  assert.equal(await page.locator('.tile').count(), 5);
  for (const tile of await page.locator('.tile').all()) {
    const box = await tile.boundingBox();
    assert.equal(box.width, 440);
    assert.equal(box.height, 280);
  }
  await page.screenshot({ path: path.join(bannerRoot, 'comparison.png'), fullPage: true });
  assert.deepEqual(errors, []);
  console.log('Validated transparent package icons, 16 earlier icon exports, four earlier tiles, five current banners/sources, inverse wordmark exports, README hero, and comparison sheets.');
} finally {
  await browser.close();
}
