import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const packagePath = new URL('package.json', root);
const lockPath = new URL('package-lock.json', root);
const shippedPaths = ['src', 'build', 'extension', 'LICENSE', 'rollup.config.mjs'];
const stableChannel = 65535;
const maxChromePart = 65535;

function git(args) {
  return execFileSync('git', args, { cwd: fileURLToPath(root), encoding: 'utf8' }).trim();
}

function parseVersion(value) {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-dev\.(0|[1-9]\d*))?$/.exec(value);
  if (!match) throw new Error(`Unsupported package version "${value}". Use X.Y.Z or X.Y.Z-dev.N.`);
  const [major, minor, patch] = match.slice(1, 4).map(Number);
  const dev = match[4] === undefined ? null : Number(match[4]);
  for (const [name, part] of Object.entries({ major, minor, patch })) {
    if (part > maxChromePart) throw new Error(`${name} version component exceeds Chrome's ${maxChromePart} limit.`);
  }
  if (dev !== null && (dev < 1 || dev >= stableChannel)) {
    throw new Error(`Development sequence must be between 1 and ${stableChannel - 1}.`);
  }
  return { major, minor, patch, dev };
}

function chromeVersion(value) {
  const { major, minor, patch, dev } = parseVersion(value);
  return `${major}.${minor}.${patch}.${dev ?? stableChannel}`;
}

function compareVersions(left, right) {
  const a = chromeVersion(left).split('.').map(Number);
  const b = chromeVersion(right).split('.').map(Number);
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  }
  return 0;
}

function validateVersionIncrease(baseVersion, currentVersion, distributedChanged) {
  const comparison = compareVersions(currentVersion, baseVersion);
  if (comparison < 0) throw new Error(`package.json version ${currentVersion} is older than main (${baseVersion}).`);
  if (distributedChanged && comparison <= 0) {
    throw new Error(`Distributed files changed without a version increase from ${baseVersion}. Run npm run build on this branch.`);
  }
  return distributedChanged && comparison > 0;
}

function nextPatch(major, minor, patch) {
  if (patch < maxChromePart) return [major, minor, patch + 1];
  if (minor < maxChromePart) return [major, minor + 1, 0];
  if (major < maxChromePart) return [major + 1, 0, 0];
  throw new Error('Version space is exhausted: all Chrome version components reached 65535.');
}

function nextDevelopmentVersion(value) {
  const { major, minor, patch, dev } = parseVersion(value);
  if (dev !== null && dev < stableChannel - 1) return `${major}.${minor}.${patch}-dev.${dev + 1}`;
  const [nextMajor, nextMinor, nextPatchNumber] = nextPatch(major, minor, patch);
  return `${nextMajor}.${nextMinor}.${nextPatchNumber}-dev.1`;
}

function normalizedPackage(packageJson) {
  const copy = structuredClone(packageJson);
  delete copy.version;
  return JSON.stringify(copy);
}

function normalizedLock(lockJson) {
  const copy = structuredClone(lockJson);
  delete copy.version;
  if (copy.packages?.['']) delete copy.packages[''].version;
  return JSON.stringify(copy);
}

function findBase() {
  const explicit = process.env.CORDWIPE_VERSION_BASE;
  if (explicit) return git(['merge-base', 'HEAD', explicit]);
  for (const ref of ['main', 'origin/main']) {
    try {
      return git(['merge-base', 'HEAD', ref]);
    } catch {
      // Try the next conventional target branch.
    }
  }
  throw new Error('Cannot find the main branch base. Fetch main or set CORDWIPE_VERSION_BASE.');
}

async function readBaseJson(base, path) {
  return JSON.parse(git(['show', `${base}:${path}`]));
}

async function distributedChanges(base, currentPackage, currentLock) {
  const changed = git(['diff', '--name-only', base, '--', ...shippedPaths]).split(/\r?\n/).filter(Boolean);
  const untracked = git(['ls-files', '--others', '--exclude-standard']).split(/\r?\n/).filter(Boolean);
  const untrackedShipped = untracked.filter(path => shippedPaths.some(prefix => path === prefix || path.startsWith(`${prefix}/`)));
  const basePackage = await readBaseJson(base, 'package.json');
  const baseLock = await readBaseJson(base, 'package-lock.json');
  const metadataChanged = normalizedPackage(basePackage) !== normalizedPackage(currentPackage);
  const dependenciesChanged = normalizedLock(baseLock) !== normalizedLock(currentLock);
  return changed.length > 0 || untrackedShipped.length > 0 || metadataChanged || dependenciesChanged;
}

function updateLockVersion(lock, version) {
  lock.version = version;
  if (lock.packages?.['']) lock.packages[''].version = version;
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
  const lockJson = JSON.parse(await readFile(lockPath, 'utf8'));
  const base = findBase();
  const basePackage = await readBaseJson(base, 'package.json');
  const changed = await distributedChanges(base, packageJson, lockJson);
  const comparison = compareVersions(packageJson.version, basePackage.version);
  const lockMismatch = packageJson.version !== lockJson.version || packageJson.version !== lockJson.packages?.['']?.version;

  if (process.argv.includes('--check')) {
    validateVersionIncrease(basePackage.version, packageJson.version, changed);
    if (lockMismatch) {
      throw new Error('package-lock.json root version does not match package.json. Run npm install --package-lock-only.');
    }
    console.log(changed ? `Version check passed: ${packageJson.version} advances main's ${basePackage.version}.` : 'Version check passed: no distributed changes require an increment.');
    return;
  }

  if (changed && comparison <= 0) {
    if (process.env.CI) {
      throw new Error(`Distributed files changed without an increased package.json version (main is ${basePackage.version}); CI will not modify versions.`);
    }
    packageJson.version = nextDevelopmentVersion(basePackage.version);
    updateLockVersion(lockJson, packageJson.version);
    await writeJson(packagePath, packageJson);
    await writeJson(lockPath, lockJson);
    console.log(`Incremented CordWipe version to ${packageJson.version} for this distributed change.`);
  } else if (lockMismatch) {
    if (process.env.CI) throw new Error('package-lock.json root version does not match package.json; CI will not modify versions.');
    updateLockVersion(lockJson, packageJson.version);
    await writeJson(lockPath, lockJson);
  }
}

export { chromeVersion, compareVersions, nextDevelopmentVersion, parseVersion, validateVersionIncrease };

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
