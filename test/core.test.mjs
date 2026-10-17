import test from 'node:test';
import assert from 'node:assert/strict';
import CordWipeCore from '../src/cordwipe-core.js';
import { setLogFn } from '../src/utils/log.js';
import { toSnowflake } from '../src/utils/helpers.js';

const AUTHOR = '10000000000000001';
const GUILD = '10000000000000002';
const CHANNEL = '10000000000000003';
const CHANNEL_2 = '10000000000000004';
const LOW = '10000000000000010';
const MID = '10000000000000020';
const HIGH = '10000000000000030';
const TOP = '10000000000000040';
const base = (overrides = {}) => ({ authToken: 'synthetic-token', authorId: AUTHOR,
  guildId: GUILD, channelId: CHANNEL, maxId: TOP, searchDelay: 1000,
  deleteDelay: 1000, ...overrides });
const msg = (id, overrides = {}) => ({ id, channel_id: CHANNEL, guild_id: GUILD,
  author: { id: AUTHOR }, content: 'keep match', type: 0, ...overrides });
const response = (status, value, headers = {}) => ({ status, ok: status >= 200 && status < 300,
  headers: { get: name => headers[name] ?? headers[name.toLowerCase()] ?? null },
  text: async () => typeof value === 'string' ? value : JSON.stringify(value) });
const serverSearch = messages => response(200, { total_results: messages.length,
  messages: messages.length ? [messages.map(message => ({ ...message, hit: true }))] : [] });
const makeCore = (fetch, { wait = async () => {}, ask = async () => true } = {}) => {
  const core = new CordWipeCore({ fetch, wait, ask });
  core.options = { ...core.options, ...base() };
  core.onLog = () => {};
  setLogFn((level, args) => { if (process.env.CORDWIPE_TEST_DEBUG) console.log(level, ...args); });
  return core;
};
const route = url => new URL(url).pathname.replace(/^\/api\/v9/, '') + new URL(url).search;

test('only deletes own messages, applies exact scope and all selected filters across descending pages', async () => {
  const seen = [];
  const rows = [
    msg(HIGH, { content: 'MATCH https://example.test', attachments: [{ id: 'a' }], pinned: false }),
    msg(MID, { content: 'match https://example.test', attachments: [{ id: 'b' }], pinned: true }),
    msg('10000000000000019', { content: 'unrelated https://example.test', attachments: [{ id: 'c' }] }),
    msg('10000000000000018', { content: 'match https://example.test', attachments: [{ id: 'd' }], channel_id: CHANNEL_2 }),
    msg('10000000000000017', { content: 'match https://example.test', attachments: [{ id: 'e' }], author: { id: '10000000000000005' } }),
    msg('10000000000000016', { content: 'other https://example.test', attachments: [{ id: 'f' }] }),
    msg('10000000000000015', { content: 'match https://example.test', attachments: [] }),
    msg(LOW, { content: 'unrelated https://example.test', attachments: [{ id: 'g' }] }),
  ];
  const fetch = async (url, init) => {
    const path = route(url);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path.includes('/messages/search?')) {
      const before = BigInt(new URL(url).searchParams.get('max_id'));
      const page = before === BigInt(TOP) ? rows.slice(0, 2) : rows.slice(2).filter(m => BigInt(m.id) < before);
      return serverSearch(page);
    }
    if (init.method === 'DELETE') { seen.push(path); return response(204, ''); }
    throw new Error(`Unexpected synthetic request: ${init.method} ${path}`);
  };
  const core = makeCore(fetch);
  core.options = { ...base(), content: 'match', pattern: 'https', hasLink: true, hasFile: true };
  core.options.includePinned = false;
  core.wait = async () => {};
  const result = await core.run();
  assert.equal(result.status, 'completed');
  assert.deepEqual(seen, [`/channels/${CHANNEL}/messages/${HIGH}`]);
  assert.equal(result.delCount, 1);
  assert.equal(result.skippedCount, 7);
});

test('rejects mismatched signed-in identity before searching or deleting', async () => {
  const calls = [];
  const core = makeCore(async (url, init) => {
    calls.push(route(url));
    if (route(url) === '/users/@me') return response(200, { id: '10000000000000099' });
    throw new Error('unexpected request');
  });
  const state = await core.run();
  assert.equal(state.status, 'failed');
  assert.deepEqual(calls, ['/users/@me']);
  assert.equal(state.delCount, 0);
});

test('validates DM and group DM channel types before history access', async t => {
  for (const type of [1, 3]) await t.test(`type ${type}`, async () => {
    const calls = [];
    const core = makeCore(async url => {
      const path = route(url); calls.push(path);
      if (path === '/users/@me') return response(200, { id: AUTHOR });
      if (path === `/channels/${CHANNEL}`) return response(200, { id: CHANNEL, type });
      if (path.includes('/messages?')) return response(200, []);
      throw new Error(`unexpected ${path}`);
    });
    core.options = { ...base({ guildId: '@me' }) };
    const result = await core.run();
    assert.equal(result.status, 'completed');
    assert.ok(calls.includes(`/channels/${CHANNEL}/messages?limit=100&before=${TOP}`));
  });
  const calls = [];
  const invalid = makeCore(async url => {
    const path = route(url); calls.push(path);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    return response(200, { id: CHANNEL, type: 0 });
  });
  invalid.options = base({ guildId: '@me' });
  assert.equal((await invalid.run()).status, 'failed');
  assert.equal(calls.some(path => path.includes('/messages?')), false);
});

test('server search uses hit messages only and walks pages with a descending cursor', async () => {
  const searchQueries = [];
  const deleted = [];
  let index = 0;
  const core = makeCore(async (url, init) => {
    const path = route(url);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path.includes('/messages/search?')) {
      const u = new URL(url); searchQueries.push(u.searchParams.get('max_id'));
      const pages = [[msg(HIGH), msg(MID, { hit: false })], [msg(LOW) ], []];
      return response(200, { total_results: 3, messages: pages[index++].map(m => ({ ...m, hit: m.hit !== false }))
        .reduce((groups, m) => { groups[0] ||= []; groups[0].push(m); return groups; }, []) });
    }
    if (init.method === 'DELETE') { deleted.push(path); return response(204, ''); }
    throw new Error(path);
  });
  const result = await core.run();
  assert.equal(result.status, 'completed');
  assert.deepEqual(searchQueries, [TOP, HIGH, LOW]);
  assert.deepEqual(deleted, [`/channels/${CHANNEL}/messages/${HIGH}`, `/channels/${CHANNEL}/messages/${LOW}`]);
  assert.equal(result.delCount, 2);
});

test('scans more than 25 results across pages, advances through a skipped-only page, and deduplicates hits', async () => {
  const testTop = '20000000000000080';
  const all = Array.from({ length: 56 }, (_, index) => {
    const id = (BigInt(testTop) - BigInt(index + 1)).toString();
    return msg(id, { content: index === 0 || index === 51 ? 'target' : 'unrelated' });
  });
  const cursors = [];
  const deleted = [];
  const confirmations = [];
  const core = makeCore(async (url, init) => {
    const path = route(url);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path.includes('/messages/search?')) {
      const cursor = BigInt(new URL(url).searchParams.get('max_id'));
      cursors.push(cursor.toString());
      const eligible = all.filter(m => BigInt(m.id) < cursor);
      const page = eligible.slice(0, 25);
      // One hit is duplicated and one entry lacks `hit`; only the identified hit is actionable.
      if (cursors.length === 1) page.push({ ...page[0], hit: true }, { ...page[1], hit: undefined });
      return response(200, { total_results: all.length, messages: page.length ? [page.map((m, i) => {
        const copy = { ...m };
        if (!(cursors.length === 1 && i === page.length - 1)) copy.hit = true;
        else delete copy.hit;
        return copy;
      })] : [] });
    }
    if (init.method === 'DELETE') { deleted.push(path); return response(204, ''); }
    throw new Error(path);
  }, { ask: async prompt => { confirmations.push(prompt); return true; } });
  core.options = base({ maxId: testTop, content: 'target' });
  const state = await core.run();
  assert.equal(state.status, 'completed');
  assert.ok(state.scannedCount > 25);
  assert.equal(state.delCount, 2);
  assert.equal(deleted.length, 2);
  assert.equal(confirmations.length, 1);
  assert.match(confirmations[0], new RegExp(`before: ${testTop}`));
  assert.deepEqual(cursors.slice(0, 3), [testTop,
    (BigInt(testTop) - 25n).toString(), (BigInt(testTop) - 50n).toString()]);
  assert.equal(cursors.length, 4);
});

test('malformed and repeated hit cursors fail closed without repeating a deletion', async t => {
  await t.test('malformed ID', async () => {
    let deletions = 0;
    const core = makeCore(async (url, init) => {
      const path = route(url);
      if (path === '/users/@me') return response(200, { id: AUTHOR });
      if (path.includes('/messages/search?')) return response(200, { messages: [[{ ...msg(HIGH), hit: true }, { ...msg('bad-id'), hit: true }]] });
      if (init.method === 'DELETE') { deletions++; return response(204, ''); }
      throw new Error(path);
    });
    const state = await core.run();
    assert.equal(state.status, 'failed');
    assert.equal(state.delCount, 0);
    assert.equal(deletions, 0);
  });
  await t.test('repeated page ID', async () => {
    let searches = 0;
    const deleted = [];
    const core = makeCore(async (url, init) => {
      const path = route(url);
      if (path === '/users/@me') return response(200, { id: AUTHOR });
      if (path.includes('/messages/search?')) {
        searches++;
        return serverSearch(searches === 1 ? [msg(HIGH)] : [msg(HIGH)]);
      }
      if (init.method === 'DELETE') { deleted.push(path); return response(204, ''); }
      throw new Error(path);
    });
    const state = await core.run();
    assert.equal(state.status, 'failed');
    assert.equal(state.delCount, 1);
    assert.equal(deleted.length, 1);
    assert.equal(searches, 2);
  });
});

test('DM history deletes only own filtered messages, treats bounds as exclusive, and stops at minId', async () => {
  const deleted = [];
  const beforeParams = [];
  const rows = [
    msg(HIGH, { guild_id: undefined, content: 'wanted' }),
    msg(MID, { guild_id: undefined, content: 'wanted' }),
    msg(LOW, { guild_id: undefined, content: 'wanted' }),
    msg('10000000000000009', { guild_id: undefined, content: 'wanted' }),
    msg('10000000000000008', { guild_id: undefined, content: 'wanted', author: { id: '10000000000000005' } }),
    msg('10000000000000007', { guild_id: undefined, content: 'unwanted' }),
  ];
  const core = makeCore(async (url, init) => {
    const path = route(url);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path === `/channels/${CHANNEL}`) return response(200, { id: CHANNEL, type: 1 });
    if (path.includes('/messages?')) { beforeParams.push(new URL(url).searchParams.get('before')); return response(200, rows); }
    if (init.method === 'DELETE') { deleted.push(path); return response(204, ''); }
    throw new Error(path);
  });
  core.options = base({ guildId: '@me', minId: LOW, maxId: TOP, content: 'wanted' });
  const state = await core.run();
  assert.equal(state.status, 'completed');
  assert.deepEqual(beforeParams, [TOP]);
  assert.deepEqual(deleted, [`/channels/${CHANNEL}/messages/${HIGH}`, `/channels/${CHANNEL}/messages/${MID}`]);
  assert.equal(state.skippedCount, 4);
});

test('repeated DM history page fails closed instead of counting the same message repeatedly', async () => {
  const repeated = msg(HIGH, { guild_id: undefined });
  let searches = 0;
  let deletes = 0;
  const core = makeCore(async (url, init) => {
    const path = route(url);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path === `/channels/${CHANNEL}`) return response(200, { id: CHANNEL, type: 1 });
    if (path.includes('/messages?')) { searches++; return response(200, [repeated]); }
    if (init.method === 'DELETE') { deletes++; return response(204, ''); }
    throw new Error(path);
  });
  core.options = base({ guildId: '@me' });

  const state = await core.run();

  assert.equal(state.status, 'failed');
  assert.equal(state.delCount, 1);
  assert.equal(state.missingCount, 0);
  assert.equal(searches, 2);
  assert.equal(deletes, 1);
});

test('NSFW scope is sent to server search and shown in the deletion confirmation', async () => {
  const requests = [];
  const confirmations = [];
  let searches = 0;
  const core = makeCore(async (url, init) => {
    const path = route(url);
    requests.push(url);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path.includes('/messages/search?')) return searches++ === 0
      ? serverSearch([msg(HIGH, { content: 'https://example.test\nforged confirmation line', attachments: [{ id: 'synthetic-file' }] })])
      : serverSearch([]);
    if (init.method === 'DELETE') return response(204, '');
    throw new Error(path);
  }, { ask: async prompt => { confirmations.push(prompt); return true; } });
  core.options = base({ includeNsfw: true, hasLink: true, hasFile: true });

  const state = await core.run();

  assert.equal(state.status, 'completed');
  const query = new URL(requests.find(url => url.includes('/messages/search?'))).searchParams;
  assert.equal(query.get('include_nsfw'), 'true');
  assert.deepEqual(query.getAll('has'), ['link', 'file']);
  assert.match(confirmations[0], /include NSFW: true/);
  assert.ok(confirmations[0].includes(`${HIGH}: https://example.test forged confirmation line`));
  assert.ok(!confirmations[0].includes('https://example.test\nforged'));
});

test('reply messages are eligible while unsupported message types are skipped', async () => {
  const deleted = [];
  let search = 0;
  const core = makeCore(async (url, init) => {
    const path = route(url);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path.includes('/messages/search?')) return search++ === 0
      ? serverSearch([msg(HIGH, { type: 19 }), msg(MID, { type: 21 })])
      : serverSearch([]);
    if (init.method === 'DELETE') { deleted.push(path); return response(204, ''); }
    throw new Error(path);
  });
  const state = await core.run();
  assert.equal(state.status, 'completed');
  assert.deepEqual(deleted, [`/channels/${CHANNEL}/messages/${HIGH}`]);
  assert.equal(state.skippedCount, 1);
});

test('invalid regex and missing author or scope fail before any API request', async t => {
  for (const [name, options] of [
    ['invalid regex', base({ pattern: '[' })],
    ['missing author', base({ authorId: '' })],
    ['missing server', base({ guildId: '' })],
    ['DM without channel', base({ guildId: '@me', channelId: '' })],
  ]) await t.test(name, async () => {
    let count = 0;
    const core = makeCore(async () => { count++; throw new Error('must not fetch'); });
    core.options = options;
    await assert.rejects(core.run());
    assert.equal(count, 0);
  });
});

test('does not count a non-JSON or unexpected DELETE response as success', async () => {
  for (const bad of [response(200, 'not-json'), response(500, { message: 'failure' })]) {
    const core = makeCore(async (url, init) => {
      const path = route(url);
      if (path === '/users/@me') return response(200, { id: AUTHOR });
      if (path.includes('/messages/search?')) return serverSearch([msg(HIGH)]);
      if (init.method === 'DELETE') return bad;
      throw new Error(path);
    });
    const state = await core.run();
    assert.equal(state.status, 'failed');
    assert.equal(state.delCount, 0);
    assert.equal(state.failCount, 1);
  }
});

test('counts only Discord unknown-message 404 as missing and 204 as deleted', async () => {
  const outcomes = [response(404, { code: 10008 }), response(204, '')];
  let searched = false;
  const core = makeCore(async (url, init) => {
    const path = route(url);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path.includes('/messages/search?')) { if (!searched) { searched = true; return serverSearch([msg(HIGH), msg(MID)]); } return serverSearch([]); }
    if (init.method === 'DELETE') return outcomes.shift();
    throw new Error(path);
  });
  const state = await core.run();
  assert.equal(state.status, 'completed');
  assert.equal(state.missingCount, 1);
  assert.equal(state.delCount, 1);
});

test('other DELETE 404 codes fail rather than being reported as missing', async () => {
  const core = makeCore(async (url, init) => {
    const path = route(url);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path.includes('/messages/search?')) return serverSearch([msg(HIGH)]);
    if (init.method === 'DELETE') return response(404, { code: 50013, message: 'Missing Permissions' });
    throw new Error(path);
  });
  const state = await core.run();
  assert.equal(state.status, 'failed');
  assert.equal(state.delCount, 0);
  assert.equal(state.missingCount, 0);
  assert.equal(state.failCount, 1);
});

test('401 and 403 stop without claiming deletion', async t => {
  for (const status of [401, 403]) await t.test(String(status), async () => {
    const core = makeCore(async (url, init) => {
      const path = route(url);
      if (path === '/users/@me') return response(200, { id: AUTHOR });
      if (path.includes('/messages/search?')) return serverSearch([msg(HIGH)]);
      if (init.method === 'DELETE') return response(status, { message: 'denied' });
      throw new Error(path);
    });
    const state = await core.run();
    assert.equal(state.status, 'failed');
    assert.equal(state.delCount, 0);
    assert.equal(state.failCount, 1);
  });
});

test('429 honors the larger body/header cooldown in seconds and bounds attempts', async () => {
  let deletes = 0;
  const waits = [];
  const core = makeCore(async (url, init) => {
    const path = route(url);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path.includes('/messages/search?')) return serverSearch([msg(HIGH)]);
    if (init.method === 'DELETE') {
      deletes++;
      return response(429, { retry_after: 2.5 }, { 'Retry-After': '1' });
    }
    throw new Error(path);
  }, { wait: async ms => { waits.push(ms); } });
  const state = await core.run();
  assert.equal(state.status, 'failed');
  assert.equal(state.delCount, 0);
  assert.equal(deletes, 5);
  assert.deepEqual(waits, [2500, 2500, 2500, 2500, 2500]);
  assert.equal(core.stats.throttledCount, 5);
});

test('429 retries a DELETE after the longer header cooldown and counts one 204 result once', async t => {
  await t.test('header is longer than body', async () => {
    let deletes = 0;
    let searches = 0;
    const waits = [];
    const core = makeCore(async (url, init) => {
      const path = route(url);
      if (path === '/users/@me') return response(200, { id: AUTHOR });
      if (path.includes('/messages/search?')) return searches++ === 0 ? serverSearch([msg(HIGH)]) : serverSearch([]);
      if (init.method === 'DELETE') {
        deletes++;
        return deletes === 1 ? response(429, { retry_after: 1.5 }, { 'Retry-After': '3' }) : response(204, '');
      }
      throw new Error(path);
    }, { wait: async ms => { waits.push(ms); } });
    const state = await core.run();
    assert.equal(state.status, 'completed');
    assert.equal(deletes, 2);
    assert.deepEqual(waits, [3000, 1000, 1000]);
    assert.equal(state.delCount, 1);
    assert.equal(state.failCount, 0);
    assert.equal(state.missingCount, 0);
  });
  for (const retry of [{ retry_after: 'not-a-number' }, {}]) await t.test(`invalid or absent retry body ${JSON.stringify(retry)}`, async () => {
    let deletes = 0;
    let searches = 0;
    const waits = [];
    const core = makeCore(async (url, init) => {
      const path = route(url);
      if (path === '/users/@me') return response(200, { id: AUTHOR });
      if (path.includes('/messages/search?')) return searches++ === 0 ? serverSearch([msg(HIGH)]) : serverSearch([]);
      if (init.method === 'DELETE') return deletes++ === 0 ? response(429, retry) : response(204, '');
      throw new Error(path);
    }, { wait: async ms => { waits.push(ms); } });
    const state = await core.run();
    assert.equal(state.status, 'completed');
    assert.equal(state.delCount, 1);
    assert.deepEqual(waits, [1000, 1000, 1000]);
  });
});

test('malformed 429 bodies and Discord edge-block codes stop without retry', async t => {
  for (const blocked of [response(429, 'not-json'), response(429, { code: 40333, message: 'blocked' })]) await t.test(String(blocked.status) + JSON.stringify(blocked), async () => {
    let deleteCalls = 0;
    const waits = [];
    const core = makeCore(async (url, init) => {
      const path = route(url);
      if (path === '/users/@me') return response(200, { id: AUTHOR });
      if (path.includes('/messages/search?')) return serverSearch([msg(HIGH)]);
      if (init.method === 'DELETE') { deleteCalls++; return blocked; }
      throw new Error(path);
    }, { wait: async ms => { waits.push(ms); } });
    const state = await core.run();
    assert.equal(state.status, 'failed');
    assert.equal(state.delCount, 0);
    assert.equal(deleteCalls, 1);
    assert.deepEqual(waits, []);
  });
});

test('stopping during a server cooldown makes the next run wait before any API request', async () => {
  let waitCalls = 0;
  const timeline = [];
  let searches = 0;
  let deleteCalls = 0;
  const core = makeCore(async (url, init) => {
    const path = route(url);
    timeline.push(`request:${path}`);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path.includes('/messages/search?')) return ++searches < 3 ? serverSearch([msg(HIGH)]) : serverSearch([]);
    if (init.method === 'DELETE') return ++deleteCalls === 1
      ? response(429, { retry_after: 10 })
      : response(204, '');
    throw new Error(path);
  }, { wait: async (_ms, signal) => {
    waitCalls++;
    timeline.push(`wait:${waitCalls}`);
    if (waitCalls === 1) await new Promise(resolve => signal.addEventListener('abort', resolve, { once: true }));
  } });
  const firstRun = core.run();
  while (waitCalls === 0) await new Promise(resolve => setImmediate(resolve));
  core.stop();
  assert.equal((await firstRun).status, 'stopped');
  core.options = base();
  const timelineCountBeforeRestart = timeline.length;
  assert.equal((await core.run()).status, 'completed');
  assert.equal(waitCalls, 4); // Interrupted server wait, persisted wait, delete delay, page delay.
  assert.deepEqual(timeline.slice(timelineCountBeforeRestart, timelineCountBeforeRestart + 2), ['wait:2', 'request:/users/@me']);
});

test('202 search indexing waits at least configured delay and stops after bounded attempts', async () => {
  let searches = 0;
  const waits = [];
  const core = makeCore(async (url, init) => {
    const path = route(url);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path.includes('/messages/search?')) { searches++; return response(202, { retry_after: 0.25 }); }
    throw new Error(path);
  }, { wait: async ms => { waits.push(ms); } });
  const state = await core.run();
  assert.equal(state.status, 'failed');
  assert.equal(searches, 5);
  assert.deepEqual(waits, [1000, 1000, 1000, 1000, 1000]);
  assert.equal(state.delCount, 0);
});

test('stop during cooldown prevents any next page or deletion', async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const calls = [];
  const core = makeCore(async (url, init) => {
    const path = route(url); calls.push(`${init.method} ${path}`);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path.includes('/messages/search?')) return serverSearch([msg(HIGH)]);
    if (init.method === 'DELETE') return response(204, '');
    throw new Error(path);
  }, { wait: async (_ms, signal) => {
    await Promise.race([gate, new Promise(resolve => signal.addEventListener('abort', resolve, { once: true }))]);
  } });
  const pending = core.run();
  while (!core._active) await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  core.stop(); release();
  const state = await pending;
  assert.equal(state.status, 'stopped');
  assert.equal(calls.filter(call => call.startsWith('DELETE')).length, 1);
  assert.equal(calls.filter(call => call.includes('search?')).length, 1);
});

test('run snapshots filter options before awaits and rejects overlapping starts', async () => {
  let releaseIdentity;
  const identityGate = new Promise(resolve => { releaseIdentity = resolve; });
  const deleted = [];
  let searched = false;
  const core = makeCore(async (url, init) => {
    const path = route(url);
    if (path === '/users/@me') { await identityGate; return response(200, { id: AUTHOR }); }
    if (path.includes('/messages/search?')) { if (!searched) { searched = true; return serverSearch([msg(HIGH, { content: 'original filter' }), msg(MID, { content: 'mutated filter' })]); } return serverSearch([]); }
    if (init.method === 'DELETE') { deleted.push(path); return response(204, ''); }
    throw new Error(path);
  });
  core.options = base({ content: 'original' });
  const pending = core.run();
  core.options.content = 'mutated';
  await assert.rejects(core.run(), /still active/);
  releaseIdentity();
  const state = await pending;
  assert.equal(state.status, 'completed');
  assert.deepEqual(deleted, [`/channels/${CHANNEL}/messages/${HIGH}`]);
});

test('batch confirms each channel, and stop cancels the next queued channel', async () => {
  let confirms = 0;
  let searches = 0;
  const core = makeCore(async (url, init) => {
    const path = route(url);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path.includes('/messages/search?')) { searches++; return serverSearch([msg(HIGH, { channel_id: CHANNEL })]); }
    if (init.method === 'DELETE') return response(204, '');
    throw new Error(path);
  }, { ask: async () => { confirms++; if (confirms === 1) core.stop(); return true; } });
  const queue = [base({ channelId: CHANNEL }), base({ channelId: CHANNEL_2 })];
  await core.runBatch(queue);
  assert.equal(confirms, 1);
  assert.equal(searches, 1);
  assert.equal(core.state.status, 'stopped');
});

test('successful batch channels each require confirmation before deletion', async () => {
  const confirmations = [];
  const deleted = [];
  const searchCount = new Map();
  const core = makeCore(async (url, init) => {
    const path = route(url);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path.includes('/messages/search?')) {
      const channel = new URL(url).searchParams.get('channel_id');
      const count = searchCount.get(channel) || 0;
      searchCount.set(channel, count + 1);
      if (count > 0) return serverSearch([]);
      return serverSearch([msg(channel === CHANNEL ? HIGH : MID, { channel_id: channel })]);
    }
    if (init.method === 'DELETE') { deleted.push(path); return response(204, ''); }
    throw new Error(path);
  }, { ask: async prompt => { confirmations.push(prompt); return true; } });
  await core.runBatch([base({ channelId: CHANNEL }), base({ channelId: CHANNEL_2 })]);
  assert.equal(confirmations.length, 2);
  assert.match(confirmations[0], new RegExp(CHANNEL));
  assert.match(confirmations[1], new RegExp(CHANNEL_2));
  assert.deepEqual(deleted, [`/channels/${CHANNEL}/messages/${HIGH}`, `/channels/${CHANNEL_2}/messages/${MID}`]);
});

test('batch failure stops before asking for or starting the next channel', async () => {
  let confirmations = 0;
  let searches = 0;
  const core = makeCore(async (url, init) => {
    const path = route(url);
    if (path === '/users/@me') return response(200, { id: AUTHOR });
    if (path.includes('/messages/search?')) { searches++; return serverSearch([msg(HIGH)]); }
    if (init.method === 'DELETE') return response(403, { code: 50013 });
    throw new Error(path);
  }, { ask: async () => { confirmations++; return true; } });
  await core.runBatch([base({ channelId: CHANNEL }), base({ channelId: CHANNEL_2 })]);
  assert.equal(core.state.status, 'failed');
  assert.equal(confirmations, 1);
  assert.equal(searches, 1);
  assert.equal(core.state.delCount, 0);
});

test('date boundaries convert to exact Discord snowflakes', () => {
  const ms = Date.parse('2024-01-01T00:00:00.000Z');
  const expected = ((BigInt(ms) - 1420070400000n) << 22n).toString();
  assert.equal(toSnowflake('2024-01-01T00:00:00.000Z'), expected);
  assert.equal(CordWipeCore.prototype.validate.call({ options: {} }, base({ minId: '2024-01-01T00:00:00.000Z', maxId: '' })).minId, expected);
});

test('successful responses with an exhausted bucket defer the next API request', async () => {
  const timeline = [];
  const core = makeCore(async url => {
    const path = route(url);
    timeline.push('request:' + path);
    if (path === '/users/@me') return response(200, { id: AUTHOR }, { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset-After': '5' });
    if (path.includes('/messages/search?')) return serverSearch([]);
    throw new Error('Unexpected synthetic request');
  }, { wait: async ms => { timeline.push(ms); } });
  assert.equal((await core.run()).status, 'completed');
  assert.equal(timeline[0], 'request:/users/@me');
  assert.ok(timeline[1] > 0 && timeline[1] <= 5000);
  assert.match(timeline[2], /request:.*messages\/search/);
});
