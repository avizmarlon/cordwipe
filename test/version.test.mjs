import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  chromeVersion,
  compareVersions,
  nextDevelopmentVersion,
  parseVersion,
  validateVersionIncrease,
} from '../build/version.mjs';

const versionScript = fileURLToPath(new URL('../build/version.mjs', import.meta.url));

function run(command, args, cwd, extraEnv = {}) {
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, CORDWIPE_VERSION_BASE: 'main', CI: '', ...extraEnv },
  });
}

async function createVersionRepo(t) {
  const directory = await mkdtemp(join(tmpdir(), 'cordwipe-version-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const git = (...args) => {
    const result = run('git', args, directory);
    assert.equal(result.status, 0, result.stderr);
  };
  await mkdir(join(directory, 'build'), { recursive: true });
  await mkdir(join(directory, 'src'), { recursive: true });
  await writeFile(join(directory, 'build', 'version.mjs'), await readFile(versionScript));
  await writeFile(join(directory, 'src', 'index.js'), 'export const value = 1;\n');
  await writeFile(join(directory, 'README.md'), 'Synthetic version fixture.\n');
  await writeFile(join(directory, 'LICENSE'), 'MIT\n');
  const packageJson = { name: 'cordwipe-fixture', version: '0.1.0-dev.1' };
  const lockJson = { name: packageJson.name, version: packageJson.version, lockfileVersion: 3, packages: { '': { name: packageJson.name, version: packageJson.version } } };
  await writeFile(join(directory, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);
  await writeFile(join(directory, 'package-lock.json'), `${JSON.stringify(lockJson, null, 2)}\n`);
  git('init', '-b', 'main');
  git('config', 'user.name', 'CordWipe test');
  git('config', 'user.email', 'test@example.invalid');
  git('add', '.');
  git('commit', '-m', 'fixture baseline');
  git('switch', '-c', 'codex/version-fixture');
  return directory;
}

async function readJson(directory, file) {
  return JSON.parse(await readFile(join(directory, file), 'utf8'));
}

async function writeJson(directory, file, value) {
  await writeFile(join(directory, file), `${JSON.stringify(value, null, 2)}\n`);
}

test('pre-release and stable versions map to increasing four-part Chrome versions', () => {
  assert.equal(chromeVersion('0.1.0-dev.1'), '0.1.0.1');
  assert.equal(chromeVersion('0.1.0-dev.2'), '0.1.0.2');
  assert.equal(chromeVersion('0.1.0'), '0.1.0.65535');
  assert.equal(chromeVersion('0.1.1-dev.1'), '0.1.1.1');
  assert.ok(compareVersions('0.1.0-dev.2', '0.1.0-dev.1') > 0);
  assert.ok(compareVersions('0.1.0', '0.1.0-dev.65534') > 0);
  assert.ok(compareVersions('0.1.1-dev.1', '0.1.0') > 0);
});

test('development bump advances the target branch version and rolls over safely', () => {
  assert.equal(nextDevelopmentVersion('0.1.0-dev.1'), '0.1.0-dev.2');
  assert.equal(nextDevelopmentVersion('0.1.0'), '0.1.1-dev.1');
  assert.equal(nextDevelopmentVersion('0.1.0-dev.65534'), '0.1.1-dev.1');
  assert.equal(nextDevelopmentVersion('0.1.65535'), '0.2.0-dev.1');
  assert.throws(() => nextDevelopmentVersion('65535.65535.65535'), /Version space is exhausted/);
});

test('only supported package formats and Chrome component ranges are accepted', () => {
  assert.deepEqual(parseVersion('0.1.2-dev.4'), { major: 0, minor: 1, patch: 2, dev: 4 });
  for (const invalid of ['v0.1.0', '0.1', '0.1.0-rc.1', '0.1.0-dev.0', '0.1.0-dev.65535', '0.1.65536', '01.1.0']) {
    assert.throws(() => parseVersion(invalid), undefined, invalid);
  }
});

test('CI version guard exempts docs-only changes and rejects unversioned distributed changes', () => {
  assert.equal(validateVersionIncrease('0.1.0-dev.1', '0.1.0-dev.1', false), false);
  assert.throws(() => validateVersionIncrease('0.1.0-dev.1', '0.1.0-dev.1', true), /Distributed files changed/);
  assert.equal(validateVersionIncrease('0.1.0-dev.1', '0.1.0-dev.2', true), true);
  assert.throws(() => validateVersionIncrease('0.1.0-dev.2', '0.1.0-dev.1', false), /older than main/);
});

test('build command skips documentation-only changes and bumps distributable work once per branch', async t => {
  const directory = await createVersionRepo(t);
  await writeFile(join(directory, 'README.md'), 'Documentation-only change.\n');
  let result = run(process.execPath, [join(directory, 'build', 'version.mjs')], directory);
  assert.equal(result.status, 0, result.stderr);
  assert.equal((await readJson(directory, 'package.json')).version, '0.1.0-dev.1');
  result = run(process.execPath, [join(directory, 'build', 'version.mjs'), '--check'], directory, { CI: 'true' });
  assert.equal(result.status, 0, result.stderr);

  await writeFile(join(directory, 'src', 'index.js'), 'export const value = 2;\n');
  result = run(process.execPath, [join(directory, 'build', 'version.mjs')], directory);
  assert.equal(result.status, 0, result.stderr);
  assert.equal((await readJson(directory, 'package.json')).version, '0.1.0-dev.2');
  assert.equal((await readJson(directory, 'package-lock.json')).packages[''].version, '0.1.0-dev.2');

  await writeFile(join(directory, 'src', 'index.js'), 'export const value = 3;\n');
  result = run(process.execPath, [join(directory, 'build', 'version.mjs')], directory);
  assert.equal(result.status, 0, result.stderr);
  assert.equal((await readJson(directory, 'package.json')).version, '0.1.0-dev.2', 'repeat builds and later edits on the branch must not churn the version');
  result = run(process.execPath, [join(directory, 'build', 'version.mjs'), '--check'], directory, { CI: 'true' });
  assert.equal(result.status, 0, result.stderr);
});

test('CI rejects distributed changes without an increment and detects stale lock metadata', async t => {
  const directory = await createVersionRepo(t);
  await writeFile(join(directory, 'src', 'index.js'), 'export const value = 2;\n');
  const args = [join(directory, 'build', 'version.mjs')];
  let result = run(process.execPath, args, directory, { CI: 'true' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CI will not modify versions/);
  assert.equal((await readJson(directory, 'package.json')).version, '0.1.0-dev.1', 'CI must not mutate package.json');

  result = run(process.execPath, [...args, '--check'], directory, { CI: 'true' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Distributed files changed/);

  const packageJson = await readJson(directory, 'package.json');
  packageJson.version = '0.1.0-dev.2';
  await writeJson(directory, 'package.json', packageJson);
  result = run(process.execPath, [...args, '--check'], directory, { CI: 'true' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /package-lock.json root version does not match/);
});
