const TEST_KEY = '1x00000000000000000000AA';
const LIVE_KEY = '0x4AAAAAAF0Vq3T7yrXacjrJ';

export function siteKey(hostname) {
  return ['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname) ? TEST_KEY : LIVE_KEY;
}

export class ChatTurnstile {
  constructor(container) {
    this.container = container;
    this.widget = null;
    this.loading = null;
    this.pending = null;
    this.token = null;
  }

  async load() {
    if (window.turnstile?.render) return;
    if (!this.loading) {
      this.loading = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const timer = setTimeout(() => finish(false), 15000);
        const finish = (ok) => {
          clearTimeout(timer);
          delete window.powOrgTurnstileReady;
          if (ok) resolve();
          else { script.remove(); reject(Object.assign(new Error('Challenge unavailable'), { code: 'challenge_failed' })); }
        };
        window.powOrgTurnstileReady = () => finish(true);
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=powOrgTurnstileReady';
        script.async = true;
        script.onerror = () => finish(false);
        document.head.append(script);
      }).catch(error => { this.loading = null; throw error; });
    }
    await this.loading;
  }

  settle(token) {
    this.token = token || null;
    if (!this.pending) return;
    const { resolve, reject, timer } = this.pending;
    clearTimeout(timer);
    this.pending = null;
    if (token) { this.token = null; resolve(token); }
    else reject(Object.assign(new Error('Challenge failed'), { code: 'challenge_failed' }));
  }

  reset() {
    this.token = null;
    if (this.widget !== null && window.turnstile) window.turnstile.reset(this.widget);
  }

  async getToken(fresh = false) {
    await this.load();
    if (fresh) this.reset();
    if (this.token) {
      const token = this.token;
      this.token = null;
      return token;
    }
    this.container.hidden = false;
    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject, timer: setTimeout(() => this.settle(null), 120000) };
      try {
        if (this.widget === null) {
          this.widget = window.turnstile.render(this.container, {
            sitekey: siteKey(location.hostname), theme: 'dark', language: document.documentElement.lang,
            size: this.container.clientWidth >= 300 ? 'flexible' : 'compact', 'response-field': false,
            callback: token => this.settle(token),
            'error-callback': () => { this.settle(null); return true; },
            'expired-callback': () => { this.token = null; },
            'timeout-callback': () => this.settle(null),
          });
        } else if (!fresh) this.reset();
      } catch { this.settle(null); }
    }).finally(() => { this.container.hidden = true; });
  }
}
