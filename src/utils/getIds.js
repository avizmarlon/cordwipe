// Derived from Undiscord (victornpb and contributors); see LICENSE.
import { log } from './log.js';

function readStored(key) {
  const frame = document.createElement('iframe');
  frame.hidden = true;
  document.body.appendChild(frame);
  try { return JSON.parse(frame.contentWindow.localStorage.getItem(key)); }
  catch { return null; }
  finally { frame.remove(); }
}

function fromModules(pick) {
  const chunks = window.webpackChunkdiscord_app;
  if (!chunks || typeof chunks.push !== 'function') return null;
  let found = null;
  const chunk = [[Symbol('cordwipe')], {}, runtime => {
    for (const module of Object.values(runtime.c || {})) {
      try {
        const exports = module?.exports;
        for (const candidate of [exports, exports?.default]) {
          const value = candidate && pick(candidate);
          if (value) { found = value; return; }
        }
      } catch { /* Module getters may throw. Never log their contents. */ }
    }
  }];
  try { chunks.push(chunk); }
  catch { /* An unsupported client must fail without exposing module contents. */ }
  finally {
    // Remove only our own entry; another chunk may have been appended meanwhile.
    const index = chunks.indexOf(chunk);
    if (index >= 0) chunks.splice(index, 1);
  }
  return found;
}

const usableToken = value => typeof value === 'string' && value.length > 0 && !value.startsWith('dQw4w9WgXcQ:');

// Invoked only by Find & review after scope validation, never by initialization.
export function getToken() {
  const stored = readStored('token');
  if (usableToken(stored)) return stored;
  return fromModules(source => {
    const token = typeof source.getToken === 'function' && source.getToken();
    return usableToken(token) ? token : null;
  });
}

export function getAuthorId() {
  const cached = readStored('user_id_cache');
  if (typeof cached === 'string' && /^\d{17,20}$/.test(cached)) return cached;
  const id = fromModules(source => {
    const user = typeof source.getCurrentUser === 'function' && source.getCurrentUser();
    return user?.id;
  });
  if (typeof id === 'string' && /^\d{17,20}$/.test(id)) return id;
  log.error('Could not find your Author ID. Enter your numeric user ID manually.');
  return '';
}

function currentRoute() {
  const match = location.pathname.match(/^\/channels\/(@me|\d+)\/(\d+)/);
  if (!match) { log.error('Open a channel or DM first.'); return null; }
  return { guildId: match[1], channelId: match[2] };
}
export const getGuildId = () => currentRoute()?.guildId || '';
export const getChannelId = () => currentRoute()?.channelId || '';
export function fillToken() {
  try {
    const token = getToken();
    if (token) return token;
  } catch { /* Do not expose credential-bearing errors. */ }
  log.error('Could not access the current Discord session. Reload Discord and try again. This client version may not be supported; never copy or share your token.');
  return '';
}
