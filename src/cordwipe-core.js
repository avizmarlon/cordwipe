// Derived from Undiscord, Copyright (c) 2019-2025 Victornpb and contributors.
// https://github.com/victornpb/undiscord — original attribution retained.
// DM history and cursor strategy informed by feelmypain/PurgeCord; see docs/investigation.md.
import { log } from './utils/log.js';
import { wait, ask, toSnowflake, queryString } from './utils/helpers.js';

const HOSTS = ['discord.com', 'ptb.discord.com', 'canary.discord.com'];
const isId = value => typeof value === 'string' && /^[1-9]\d{16,19}$/.test(value);
const abortError = () => new DOMException('Stopped', 'AbortError');

export default class CordWipeCore {
  constructor(dependencies = {}) {
    this.api = (HOSTS.includes(globalThis.location?.hostname) ? globalThis.location.origin : 'https://discord.com') + '/api/v9';
    this.fetch = dependencies.fetch || globalThis.fetch.bind(globalThis);
    this.wait = dependencies.wait || wait;
    this.ask = dependencies.ask || ask;
    this.options = { searchDelay: 30000, deleteDelay: 1000 };
    this.resetState();
  }

  resetState() {
    if (this._active || this._batchActive) throw new Error('A run is still active.');
    this.state = { running: false, status: 'idle', delCount: 0, failCount: 0,
      missingCount: 0, skippedCount: 0, scannedCount: 0, grandTotal: 0, iterations: 0 };
    this.stats = { startTime: new Date(), throttledCount: 0, throttledTotalTime: 0, etr: 0 };
  }

  validate(options) {
    const o = { searchDelay: 30000, deleteDelay: 1000, ...options };
    if (!o.authToken || typeof o.authToken !== 'string') throw new Error('Authorization is required.');
    if (!isId(o.authorId)) throw new Error('Enter your own numeric Author ID.');
    if (o.guildId !== '@me' && !isId(o.guildId)) throw new Error('Enter a Server ID, or @me for a DM.');
    if (o.channelId && !isId(o.channelId)) throw new Error('Invalid Channel ID.');
    if (o.guildId === '@me' && !isId(o.channelId)) throw new Error('A DM requires a Channel ID.');
    for (const key of ['minId', 'maxId']) {
      o[key] = o[key] ? String(toSnowflake(o[key])) : '';
      if (o[key] && !isId(o[key])) throw new Error('Invalid message/date interval.');
    }
    if (o.minId && o.maxId && BigInt(o.minId) >= BigInt(o.maxId)) throw new Error('After must be earlier than Before.');
    if (!Number.isFinite(o.searchDelay) || o.searchDelay < 1000 || o.searchDelay > 60000 ||
        !Number.isFinite(o.deleteDelay) || o.deleteDelay < 1000 || o.deleteDelay > 60000) throw new Error('Delays must be between 1000ms and 60000ms.');
    if (o.pattern && o.pattern.length > 500) throw new Error('Pattern is too long (maximum 500 characters).');
    // Invalid expressions must stop the run, never silently broaden its scope.
    try { o.regex = o.pattern ? new RegExp(o.pattern, 'i') : null; }
    catch { throw new Error('Invalid regular expression. No messages were deleted.'); }
    return Object.freeze(o);
  }

  async runBatch(queue) {
    if (this._active || this._batchActive) throw new Error('A run is still active.');
    const jobs = queue.map(job => this.validate({ ...this.options, ...job }));
    if (!jobs.length) throw new Error('No channels selected.');
    this._batchActive = true;
    this._batchStopped = false;
    const totals = { delCount: 0, missingCount: 0, failCount: 0, scannedCount: 0, skippedCount: 0 };
    try {
      for (let i = 0; i < jobs.length && !this._batchStopped; i++) {
        log.info(`Channel ${i + 1}/${jobs.length}. Each channel needs confirmation.`);
        await this.run(true, jobs[i]);
        for (const key of Object.keys(totals)) totals[key] += this.state[key];
        if (this.state.status !== 'completed') break;
      }
    } finally {
      this._batchActive = false;
      this.options.authToken = null;
      Object.assign(this.state, totals);
      log.info(`Batch ${this.state.status}: ${totals.delCount} deleted, ${totals.missingCount} already absent, ${totals.failCount} failed.`);
      this.onStop?.(this.state, this.stats);
    }
  }

  async run(isJob = false, jobOptions = null) {
    if (this._active || (this._batchActive && !isJob)) throw new Error('A run is still active.');
    // Snapshot before any await: UI edits cannot change a confirmed run.
    const options = this.validate(jobOptions || this.options);
    this._active = true;
    this._controller = new AbortController();
    this._runOptions = options;
    this.state = { running: true, status: 'running', delCount: 0, failCount: 0,
      missingCount: 0, skippedCount: 0, scannedCount: 0, grandTotal: 0, iterations: 0 };
    this.stats = { startTime: new Date(), throttledCount: 0, throttledTotalTime: 0, etr: 0 };
    try {
      this.onStart?.(this.state, this.stats);
      const user = await this.request('/users/@me');
      if (!isId(user?.id) || user.id !== options.authorId) throw new Error('Author ID must match the signed-in account.');
      if (options.guildId === '@me') {
        const channel = await this.request(`/channels/${options.channelId}`);
        if (channel?.id !== options.channelId || ![1, 3].includes(channel.type)) throw new Error('The selected channel is not a DM or group DM.');
      }

      // Freeze the upper time boundary so messages posted during the run stay out.
      let cursor = options.maxId || toSnowflake(new Date().toISOString());
      const upperBound = cursor;
      let confirmed = false;
      while (this.state.running) {
        if (++this.state.iterations > 10000) throw new Error('Page safety limit reached. Narrow the interval and start again.');
        const { messages, total } = await this.search(cursor);
        this.checkRunning();
        this.state.grandTotal = Math.max(this.state.grandTotal, total || 0);
        if (!messages.length) break;
        // Apply the same progress guard to DM history as server search. The API's
        // `before` cursor is a request hint; never trust a repeated or malformed
        // page enough to delete from it or loop through it again.
        if (messages.some(m => !isId(m?.id) || BigInt(m.id) >= BigInt(cursor))) {
          throw new Error('Pagination did not advance. Stopped to avoid repeating a page.');
        }
        const nextCursor = messages.reduce((id, m) => BigInt(m.id) < BigInt(id) ? m.id : id, cursor);
        const unique = [...new Map(messages.map(m => [m.id, m])).values()];
        this.state.scannedCount += unique.length;
        const matches = unique.filter(m => this.matches(m));
        this.state.skippedCount += unique.length - matches.length;
        if (matches.length && !confirmed) {
          const target = options.guildId === '@me' ? `DM ${options.channelId}` : `server ${options.guildId}, channel ${options.channelId || 'ALL'}`;
          const preview = matches.slice(0, 5).map(m => `${m.id}: ${(m.content || '[attachment]').replace(/\s+/g, ' ').slice(0, 180)}`).join('\n');
          confirmed = await this.ask(`Permanently delete your matching messages in ${target}?\n` +
            `Text: ${options.content || '(any)'}; pattern: ${options.pattern || '(none)'}\n` +
            `After: ${options.minId || '(any)'}; before: ${upperBound}\n` +
            `Links: ${!!options.hasLink}; files: ${!!options.hasFile}; include pinned: ${!!options.includePinned}; include NSFW: ${!!options.includeNsfw}\n` +
            'There is no undo. Preview of the first matching page (not a final count):\n' + preview);
          this.checkRunning();
          if (!confirmed) { this.stop(); break; }
        }
        for (const message of matches) {
          this.checkRunning();
          // Reapply the immutable scope immediately before every destructive request.
          if (!this.matches(message)) throw new Error('Message no longer matches the selected scope.');
          try {
            const result = await this.request(`/channels/${message.channel_id}/messages/${message.id}`, 'DELETE');
            if (result === 'deleted') this.state.delCount++;
            else this.state.missingCount++;
          } catch (error) {
            if (error.name !== 'AbortError') this.state.failCount++;
            throw error;
          }
          this.onProgress?.(this.state, this.stats);
          await this.cooldown(options.deleteDelay);
        }
        cursor = nextCursor;
        this.onProgress?.(this.state, this.stats);
        if (options.minId && BigInt(cursor) <= BigInt(options.minId)) break;
        log.info(`Scanned ${this.state.scannedCount}; deleted ${this.state.delCount}. Waiting before the next page.`);
        await this.cooldown(options.searchDelay);
      }
      if (this.state.running) this.state.status = 'completed';
    } catch (error) {
      this.state.status = error.name === 'AbortError' && !this.state.running ? 'stopped' : 'failed';
      if (this.state.status === 'failed') log.error(error.message);
    } finally {
      this.state.running = false;
      this._active = false;
      this.stats.endTime = new Date();
      this._runOptions = null;
      this.options.authToken = null;
      const summary = `${this.state.status}: ${this.state.delCount} deleted, ${this.state.missingCount} already absent, ${this.state.failCount} failed; ${this.state.skippedCount} skipped.`;
      log.info(summary);
      if (this.state.status === 'completed') log.info('Reached the end of the available results in the selected interval. Search indexing may omit server messages.');
      if (this.state.status === 'stopped') log.warn('Stop cannot undo a deletion already sent to Discord. Counts include confirmed responses only.');
      if (!isJob) this.onStop?.(this.state, this.stats);
    }
    return this.state;
  }

  stop() {
    this._batchStopped = true;
    this.state.running = false;
    this.state.status = 'stopped';
    this._controller?.abort();
  }

  checkRunning() {
    if (!this.state.running || this._controller.signal.aborted) throw abortError();
  }

  async cooldown(ms) {
    this.checkRunning();
    await this.wait(ms, this._controller.signal);
    this.checkRunning();
  }

  async search(cursor) {
    const o = this._runOptions;
    if (o.guildId === '@me') {
      const data = await this.request(`/channels/${o.channelId}/messages?${queryString([['limit', 100], ['before', cursor]])}`);
      if (!Array.isArray(data)) throw new Error('Invalid DM history response.');
      return { messages: data, total: 0 };
    }
    const data = await this.request(`/guilds/${o.guildId}/messages/search?${queryString([
      ['author_id', o.authorId], ['channel_id', o.channelId || undefined],
      ['min_id', o.minId || undefined], ['max_id', cursor],
      ['sort_by', 'timestamp'], ['sort_order', 'desc'], ['offset', 0],
      ['has', o.hasLink ? 'link' : undefined], ['has', o.hasFile ? 'file' : undefined],
      ['content', o.content || undefined], ['include_nsfw', !!o.includeNsfw],
    ])}`);
    if (!data || !Array.isArray(data.messages) || data.messages.some(group => !Array.isArray(group))) throw new Error('Invalid server search response.');
    const messages = data.messages.flat().filter(m => m?.hit === true);
    if (data.messages.length && !messages.length) throw new Error('Server search returned no identifiable hits.');
    return { messages, total: data.total_results };
  }

  matches(message) {
    const o = this._runOptions;
    if (!isId(message?.id) || !isId(message.channel_id) || message.author?.id !== o.authorId) return false;
    if (o.channelId && message.channel_id !== o.channelId) return false;
    if (message.guild_id && message.guild_id !== o.guildId) return false;
    if (![0, 19].includes(message.type) || (message.pinned && !o.includePinned)) return false;
    if (o.minId && BigInt(message.id) <= BigInt(o.minId)) return false;
    if (o.maxId && BigInt(message.id) >= BigInt(o.maxId)) return false;
    const content = message.content || '';
    if (o.content && !content.toLowerCase().includes(o.content.toLowerCase())) return false;
    if (o.hasFile && !message.attachments?.length) return false;
    if (o.hasLink && !/https?:\/\/\S+/i.test(content) && !message.embeds?.some(e => /^https?:\/\//i.test(e.url || ''))) return false;
    return !o.regex || o.regex.test(content);
  }

  async request(path, method = 'GET') {
    const o = this._runOptions;
    // Stop cancels the wait, not Discord's cooldown; it also survives a new run.
    if (this._cooldownUntil > Date.now()) {
      const remaining = this._cooldownUntil - Date.now();
      if (remaining > 86400000) throw new Error('Server cooldown exceeds one day. Retry later.');
      log.warn('Waiting for the server cooldown before the next request.');
      await this.cooldown(remaining);
      this._cooldownUntil = 0;
    }
    for (let attempt = 0; attempt < 5; attempt++) {
      this.checkRunning();
      const controller = new AbortController();
      const cancel = () => controller.abort();
      this._controller.signal.addEventListener('abort', cancel, { once: true });
      const timeout = setTimeout(cancel, 30000);
      let response, body;
      try {
        response = await this.fetch(this.api + path, { method, headers: { Authorization: o.authToken }, signal: controller.signal, redirect: 'error', credentials: 'omit' });
        const text = await response.text();
        try { body = JSON.parse(text); } catch { body = null; }
      } catch {
        if (!this.state.running) throw abortError();
        throw new Error(`${method} request failed or timed out. Its outcome is uncertain; review before restarting.`);
      } finally {
        clearTimeout(timeout);
        this._controller.signal.removeEventListener('abort', cancel);
      }
      this.checkRunning();
      if (response.status === 401) {
        throw new Error('Discord rejected the current session (HTTP 401). Reload Discord and try again. Never copy or share your token.');
      }
      const limited = response.status === 429;
      const indexing = response.status === 202 && method === 'GET';
      if (body?.code === 40333 || (limited && !body)) {
        throw new Error('Discord returned an access/edge block. Stopped without retrying.');
      }
      if (limited || indexing) {
        const retryHeader = response.headers.get('Retry-After');
        const headerMs = retryHeader === null ? 0 : (/^\d+(\.\d+)?$/.test(retryHeader) ? Number(retryHeader) * 1000 : Date.parse(retryHeader) - Date.now());
        const bodyMs = Number(body?.retry_after) * 1000;
        const delay = Math.max(Number.isFinite(headerMs) ? headerMs : 0, Number.isFinite(bodyMs) ? bodyMs : 0, method === 'DELETE' ? o.deleteDelay : o.searchDelay);
        this._cooldownUntil = Date.now() + delay;
        if (delay > 86400000) throw new Error('Server requested a cooldown longer than one day. Stop and retry later.');
        this.stats.throttledCount++;
        this.stats.throttledTotalTime += delay;
        log.warn(`${indexing ? 'Search indexing' : 'Rate limit'}: waiting ${Math.ceil(delay / 1000)}s (${attempt + 1}/5). Stop remains available.`);
        // Even the final rate-limit response establishes a cooldown before any later job.
        await this.cooldown(delay);
        this._cooldownUntil = 0;
        continue;
      }
      const resetAfter = Number(response.headers.get('X-RateLimit-Reset-After')) * 1000;
      if (response.headers.get('X-RateLimit-Remaining') === '0' && Number.isFinite(resetAfter) && resetAfter > 0) {
        this._cooldownUntil = Math.max(this._cooldownUntil || 0, Date.now() + resetAfter);
      }
      if (method === 'DELETE' && response.status === 404 && body?.code === 10008) return 'missing';
      if (method === 'DELETE' && response.status === 204) return 'deleted';
      if (!response.ok || method === 'DELETE') throw new Error(`${method} failed (HTTP ${response.status}). Stopped; no success assumed.`);
      if (!body) throw new Error('Invalid API response. Stopped without assuming success.');
      return body;
    }
    throw new Error('Retry limit reached. Stopped; review the log before restarting.');
  }
}
