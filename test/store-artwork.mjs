// Validate approved store assets without regenerating or changing them.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const root = new URL('../', import.meta.url);
const assets = [
  ['extension/icons/icon16.png', 16, 16, 6],
  ['extension/icons/icon48.png', 48, 48, 6],
  ['extension/icons/icon128.png', 128, 128, 6],
  ['images/store/icons/approved-chat-bin.png', 512, 512, 6],
  ['images/store/banners/2026-10-17/01-focus-440x280.png', 440, 280, 2],
  ['images/store/banners/2026-10-17/sources/01-focus-1540x980.png', 1540, 980, 2],
  ['images/cordwipe-banner.png', 880, 560, 2],
  ...['02-filters', '03-operation', '01-launcher'].map(name =>
    [`images/store/screenshots/real/${name}.png`, 1280, 800, 2]),
  ...['01-launcher', '02-filter-configuration', '03-operation-progress'].map(name =>
    [`images/store/screenshots/${name}.png`, 1280, 800, 2]),
];

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.route('**/*', route => route.abort('blockedbyclient'));
  for (const [file, width, height, colorType] of assets) {
    const png = await readFile(new URL(file, root));
    assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), file);
    assert.equal(png.readUInt32BE(16), width, `${file} width`);
    assert.equal(png.readUInt32BE(20), height, `${file} height`);
    assert.equal(png[25], colorType, `${file} color/alpha`);
    let offset = 8;
    while (offset < png.length) {
      const length = png.readUInt32BE(offset);
      const type = png.toString('ascii', offset + 4, offset + 8);
      assert.ok(['IHDR', 'IDAT', 'IEND', 'sRGB', 'iCCP', 'gAMA', 'cHRM', 'pHYs'].includes(type), `${file}: unexpected metadata ${type}`);
      offset += length + 12;
    }
    assert.equal(offset, png.length, `${file} chunk boundaries`);
    const decoded = await page.evaluate(async data => {
      const img = new Image();
      img.src = `data:image/png;base64,${data}`;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return { width: img.width, height: img.height, cornerAlpha: ctx.getImageData(0, 0, 1, 1).data[3] };
    }, png.toString('base64'));
    assert.equal(decoded.width, width, `${file} decoded width`);
    assert.equal(decoded.height, height, `${file} decoded height`);
    if (colorType === 6) assert.equal(decoded.cornerAlpha, 0, `${file} transparent corner`);
  }
  console.log(`Validated ${assets.length} approved/source/test PNGs: dimensions, decoding, alpha and metadata.`);
} finally {
  await browser.close();
}
