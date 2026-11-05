// One request at a time. A new submission after failure replaces unsent work.
export class WebChatClient {
  constructor({ challenge, fetcher = globalThis.fetch.bind(globalThis), onChange = () => {},
    onReply = () => {}, now = Date.now, timeout = 80000 }) {
    Object.assign(this, { challenge, fetcher, onChange, onReply, now, timeout });
    this.queue = [];
    this.active = [];
    this.busy = false;
    this.resetting = false;
    this.liveSession = false;
    this.failure = null;
    this.retryAt = 0;
  }

  snapshot() {
    return { busy: this.busy, resetting: this.resetting, failure: this.failure, queued: this.queue.length,
      pending: this.active.length + this.queue.length,
      retrySeconds: Math.max(0, Math.ceil((this.retryAt - this.now()) / 1000)) };
  }

  changed() { this.onChange(this.snapshot()); }

  enqueue(message, delivery = () => {}) {
    if (this.resetting || this.failure === 'reset_error') return 'reset_error';
    message = message.trim();
    if (!message) return 'empty';
    if (message.length > 1000) return 'too_long';
    if (this.failure && !this.busy) {
      if (['session_limit', 'budget_exhausted'].includes(this.failure)) return this.failure;
      if (this.snapshot().retrySeconds) return 'cooldown';
      // A deliberate new submission must never replay the failed batch or stale follow-ups.
      this.discardPending();
    }
    if ([...this.queue.map(item => item.message), message].join('\n').length > 1000) return 'queue_full';
    this.queue.push({ message, delivery });
    delivery('queued');
    this.changed();
    if (!this.busy && !this.failure) void this.run();
    return null;
  }

  async post(path, message, token) {
    const headers = {};
    const options = { method: 'POST', credentials: 'same-origin', headers,
      signal: AbortSignal.timeout(this.timeout) };
    if (message !== undefined) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify({ message });
    }
    if (token) headers['X-PowOrg-Turnstile'] = token;
    const response = await this.fetcher(`/api/external/web/${path}`, options);
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    return { response, data };
  }

  async run() {
    if (this.busy || this.now() < this.retryAt) return;
    if (!this.active.length) this.active = this.queue.splice(0);
    if (!this.active.length) return;
    this.busy = true;
    this.failure = null;
    this.active.forEach(item => item.delivery('sending'));
    this.changed();
    try {
      const message = this.active.map(item => item.message).join('\n');
      let token = this.liveSession ? null : await this.challenge.getToken();
      let result = await this.post('messages', message, token);
      // Session cookies are HttpOnly: let the server tell us when it needs a new challenge.
      if (result.response.status === 403 && result.data?.error === 'challenge_required') {
        this.liveSession = false;
        token = await this.challenge.getToken(true);
        result = await this.post('messages', message, token);
      }
      const { response, data } = result;
      if (!response.ok || typeof data?.reply !== 'string' || !data.reply.trim()) {
        const allowed = ['challenge_required', 'challenge_failed', 'busy', 'rate_limited',
          'session_limit', 'budget_exhausted', 'agent_error', 'timeout', 'unavailable'];
        let code = allowed.includes(data?.error) ? data.error : 'error';
        if ([404, 503].includes(response.status) || data?.error === 'upstream_unavailable') code = 'unavailable';
        if (response.status === 429) {
          if (!['session_limit', 'budget_exhausted'].includes(code)) code = 'rate_limited';
          const raw = response.headers.get('Retry-After');
          const seconds = raw && /^\d+$/.test(raw) ? Number(raw) : 0;
          this.retryAt = this.now() + (Number.isSafeInteger(seconds) && seconds > 0 ? seconds : 5) * 1000;
        }
        if (['challenge_required', 'challenge_failed'].includes(code)) {
          this.liveSession = false;
          this.challenge.reset();
        }
        throw Object.assign(new Error('Chat request failed'), { code });
      }
      this.liveSession = true;
      this.active.forEach(item => item.delivery('sent'));
      this.active = [];
      this.onReply(data.reply);
    } catch (error) {
      this.failure = error.name === 'TimeoutError' || error.name === 'AbortError' ? 'timeout' : error.code || 'error';
      this.active.forEach(item => item.delivery('failed'));
    } finally {
      this.busy = false;
      this.changed();
    }
    // Include every line queued during the previous reply in a single next request.
    if (!this.failure && this.queue.length) void this.run();
  }

  retry() {
    if (this.failure === 'reset_error') return this.reset();
    return this.run();
  }

  discardPending() {
    if (this.busy || !this.failure || this.failure === 'reset_error') return false;
    [...this.active, ...this.queue].forEach(item => item.delivery('skipped'));
    this.active = [];
    this.queue = [];
    // Dropping local messages cannot bypass server limits or a Retry-After cooldown.
    if (!['session_limit', 'budget_exhausted'].includes(this.failure)) {
      this.failure = this.snapshot().retrySeconds ? 'rate_limited' : null;
    }
    this.changed();
    return true;
  }

  async reset() {
    if (this.busy) return false;
    this.busy = true;
    this.resetting = true;
    this.changed();
    try {
      const { response } = await this.post('session/reset');
      if (response.status !== 204) throw new Error('Reset failed');
      this.queue = [];
      this.active = [];
      this.failure = null;
      this.retryAt = 0;
      this.liveSession = false;
      this.challenge.reset();
      return true;
    } catch {
      this.failure = 'reset_error';
      return false;
    } finally {
      this.busy = false;
      this.resetting = false;
      this.changed();
    }
  }
}
