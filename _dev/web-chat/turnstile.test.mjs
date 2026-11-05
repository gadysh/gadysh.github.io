import test from 'node:test';
import assert from 'node:assert/strict';
import { ChatTurnstile } from '../../assets/js/web-chat-turnstile.mjs';

function environment(t, width = 330) {
  const originals = new Map(['window', 'document', 'location'].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  let options;
  let resets = 0;
  let count = 0;
  const container = { hidden: true, clientWidth: width };
  globalThis.location = { hostname: '127.0.0.1' };
  globalThis.document = { documentElement: { lang: 'he' } };
  globalThis.window = { turnstile: {
    render: (target, config) => { assert.equal(target, container); options = config; queueMicrotask(() => config.callback(`test-${++count}`)); return 'widget-1'; },
    reset: id => { assert.equal(id, 'widget-1'); resets++; queueMicrotask(() => options.callback(`test-${++count}`)); },
  } };
  t.after(() => { for (const [key, value] of originals) { if (value) Object.defineProperty(globalThis, key, value); else delete globalThis[key]; } });
  return { container, options: () => options, resets: () => resets };
}
test('renders real API options with official local test key; tokens are consumed and refreshed', async t => {
  const env = environment(t);
  const challenge = new ChatTurnstile(env.container);
  assert.equal(await challenge.getToken(), 'test-1');
  assert.equal(env.options().sitekey, '1x00000000000000000000AA');
  assert.equal(env.options().language, 'he');
  assert.equal(env.options().size, 'flexible');
  assert.equal(env.options()['response-field'], false);
  assert.equal(env.container.hidden, true);
  assert.equal(await challenge.getToken(true), 'test-2');
  assert.equal(env.resets(), 1);
  assert.equal(await challenge.getToken(), 'test-3');
});
test('narrow container uses compact widget; expiry discards cached tokens', async t => {
  const env = environment(t, 280);
  const challenge = new ChatTurnstile(env.container);
  await challenge.getToken();
  assert.equal(env.options().size, 'compact');
  env.options().callback('cached');
  env.options()['expired-callback']();
  assert.equal(await challenge.getToken(), 'test-2');
});
test('widget callback error and timeout reject without leaking raw error codes', async t => {
  const env = environment(t);
  const challenge = new ChatTurnstile(env.container);
  await challenge.getToken();
  window.turnstile.reset = () => queueMicrotask(() => env.options()['error-callback']('private-code'));
  await assert.rejects(challenge.getToken(), error => error.code === 'challenge_failed' && !error.message.includes('private-code'));
  window.turnstile.reset = () => queueMicrotask(() => env.options()['timeout-callback']());
  await assert.rejects(challenge.getToken(), error => error.code === 'challenge_failed');
});
test('script load failure fails closed and permits a later load attempt', async t => {
  const env = environment(t);
  delete window.turnstile;
  let loads = 0;
  document.createElement = () => ({ remove() {} });
  document.head = { append(script) { loads++; queueMicrotask(() => script.onerror()); } };
  const challenge = new ChatTurnstile(env.container);
  await assert.rejects(challenge.getToken(), error => error.code === 'challenge_failed');
  await assert.rejects(challenge.getToken(), error => error.code === 'challenge_failed');
  assert.equal(loads, 2);
});
