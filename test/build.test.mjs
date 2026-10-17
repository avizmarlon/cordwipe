import test from 'node:test';
import assert from 'node:assert/strict';
import { string } from '../build/strings-plugin.mjs';

test('imported HTML and CSS produce the same output with LF, CRLF or CR line endings', () => {
  const plugin = string({ include: ['**/*.html', '**/*.css'] });
  for (const extension of ['html', 'css']) {
    const id = `/project/src/ui/example.${extension}`;
    const lf = 'first\nsecond\nthird\n';
    const crlf = lf.replace(/\n/g, '\r\n');
    const cr = lf.replace(/\n/g, '\r');
    const expected = plugin.transform(lf, id)?.code;
    assert.ok(expected);
    assert.equal(plugin.transform(crlf, id)?.code, expected);
    assert.equal(plugin.transform(cr, id)?.code, expected);
  }
});