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
  assert.deepEqual(errors, []);
  console.log('Validated 16 transparent icon exports, four RGB 440x280 tiles, and comparison sheets.');
} finally {
  await browser.close();
}
