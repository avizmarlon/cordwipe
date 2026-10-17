// Helpers
export const wait = (ms, signal) => new Promise((resolve, reject) => {
  const abort = () => { clearTimeout(timer); reject(new DOMException('Stopped', 'AbortError')); };
  const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(); }, ms);
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
});
export const msToHMS = s => `${s / 3.6e6 | 0}h ${(s % 3.6e6) / 6e4 | 0}m ${(s % 6e4) / 1000 | 0}s`;
export const escapeHTML = html => String(html).replace(/[&<"']/g, m => ({ '&': '&amp;', '<': '&lt;', '"': '&quot;', '\'': '&#039;' })[m]);
export const redact = str => `<x>${escapeHTML(str)}</x>`;
export const queryString = params => params.filter(p => p[1] !== undefined).map(p => p[0] + '=' + encodeURIComponent(p[1])).join('&');
export const ask = async msg => new Promise(resolve => setTimeout(() => resolve(window.confirm(msg)), 10));
export const toSnowflake = value => {
  if (/^\d+$/.test(String(value))) return String(value);
  const ms = new Date(value).getTime();
  if (!Number.isSafeInteger(ms) || ms <= 1420070400000) throw new Error('Invalid date boundary.');
  return ((BigInt(ms) - 1420070400000n) << 22n).toString();
};
export const replaceInterpolations = (str, obj, removeMissing = false) => str.replace(/\{\{([\w_]+)\}\}/g, (m, key) => obj[key] || (removeMissing ? '' : m));
