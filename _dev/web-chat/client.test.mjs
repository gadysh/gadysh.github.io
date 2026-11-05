import test from 'node:test';
import assert from 'node:assert/strict';
import { WebChatClient } from '../../assets/js/web-chat-client.mjs';
import { siteKey } from '../../assets/js/web-chat-turnstile.mjs';
import { createMock } from './mock-server.mjs';

const wait = async predicate => {
  for (let i = 0; i < 400; i++) { if (predicate()) return; await new Promise(r => setTimeout(r, 5)); }
  throw new Error('Client did not settle');
};
async function fixture(t, options = {}) {
  const mock = await createMock(options);
  t.after(mock.close);
  let cookie = '';
  let tokens = 0;
  let resets = 0;
  const calls = [];
  const replies = [];
  const challenge = { getToken: async fresh => { calls.push({ fresh: Boolean(fresh) }); return `test-${++tokens}`; }, reset: () => resets++ };
  const fetcher = async (path, init) => {
    assert.equal(init.credentials, 'same-origin');
    assert.equal(init.method, 'POST');
    assert.equal(Object.keys(init.headers).some(key => /dev.key|authorization/i.test(key)), false);
    if (path.endsWith('/messages')) {
      assert.equal(init.headers['Content-Type'], 'application/json');
      assert.deepEqual(Object.keys(JSON.parse(init.body)), ['message']);
    } else assert.equal(init.body, undefined);
    const res = await fetch(mock.origin + path, { ...init, headers: { ...init.headers, ...(cookie ? { Cookie: cookie } : {}) } });
    if (res.headers.has('set-cookie')) cookie = res.headers.get('set-cookie').split(';')[0];
    return res;
  };
  const client = new WebChatClient({ challenge, fetcher, onReply: reply => replies.push(reply), ...options.client });
  return { mock, client, replies, calls, challenge, fetcher, resets: () => resets };
}

test('initial token, HttpOnly cookie continuity, exact body and a single combined follow-up', async t => {
  const { client, mock, replies, calls } = await fixture(t, { delay: 60 });
  client.enqueue('ראשונה');
  await wait(() => mock.requests.length === 1);
  client.enqueue('שנייה');
  client.enqueue('שלישית');
  assert.equal(await client.reset(), false);
  await wait(() => !client.busy && !client.queue.length);
  assert.deepEqual(mock.requests.map(r => r.message), ['ראשונה', 'שנייה\nשלישית']);
  assert.deepEqual(mock.requests.map(r => r.challenged), [true, false]);
  assert.equal(mock.requests[1].session, true);
  assert.equal(calls.length, 1);
  assert.equal(replies.length, 2);
});
test('expired session refreshes token and retries the exact same batch once', async t => {
  const { client, mock, calls } = await fixture(t, { plan: [{}, { status: 403, error: 'challenge_required', expire: true }] });
  client.enqueue('ראשונה');
  await wait(() => !client.busy);
  client.enqueue('המשך');
  await wait(() => !client.busy);
  assert.equal(client.failure, null);
  assert.deepEqual(mock.requests.map(r => r.message), ['ראשונה', 'המשך', 'המשך']);
  assert.deepEqual(calls, [{ fresh: false }, { fresh: true }]);
});
test('repeated challenge_required stops after one retry; queue and failed message stay', async t => {
  const { client, mock } = await fixture(t, { plan: Array.from({ length: 2 }, () => ({ status: 403, error: 'challenge_required' })) });
  client.enqueue('ניסיון');
  client.enqueue('ממתינה');
  await wait(() => !client.busy);
  assert.equal(mock.requests.length, 2);
  assert.equal(client.failure, 'challenge_required');
  assert.equal(client.active[0].message, 'ניסיון');
  assert.equal(client.queue[0].message, 'ממתינה');
});
test('challenge_failed resets widget and requires explicit retry', async t => {
  const { client, mock, resets } = await fixture(t, { plan: [{ status: 403, error: 'challenge_failed' }] });
  client.enqueue('שלום');
  await wait(() => !client.busy);
  assert.equal(client.failure, 'challenge_failed');
  assert.equal(resets(), 1);
  assert.equal(mock.requests.length, 1);
  await client.retry();
  assert.equal(client.failure, null);
  assert.equal(mock.requests.length, 2);
});
test('429 honors Retry-After without auto-retry and preserves both batches', async t => {
  let now = 0;
  const { client, mock } = await fixture(t, { plan: [{ status: 429, error: 'rate_limited', headers: { 'Retry-After': '17' } }], client: { now: () => now } });
  client.enqueue('failed');
  client.enqueue('queued');
  await wait(() => !client.busy);
  assert.equal(client.snapshot().retrySeconds, 17);
  await client.retry();
  assert.equal(mock.requests.length, 1);
  now = 17000;
  await client.retry();
  await wait(() => !client.busy);
  assert.deepEqual(mock.requests.map(r => r.message), ['failed', 'failed', 'queued']);
});
for (const [status, code, expected] of [[409,'busy','busy'], [503,'unavailable','unavailable'], [404,'not_found','unavailable'], [502,'agent_error','agent_error'], [504,'timeout','timeout'], [429,'session_limit','session_limit'], [429,'budget_exhausted','budget_exhausted']]) {
  test(`${status} ${code} retains message and pauses queue`, async t => {
    const { client, mock } = await fixture(t, { plan: [{ status, error: code }] });
    client.enqueue('failed'); client.enqueue('queued');
    await wait(() => !client.busy);
    assert.equal(client.failure, expected);
    assert.equal(mock.requests.length, 1);
    assert.equal(client.queue.length, 1);
  });
}
test('reset has no body, clears only on 204, next turn gets a fresh token', async t => {
  const { client, mock, calls } = await fixture(t);
  client.enqueue('first'); await wait(() => !client.busy);
  assert.equal(await client.reset(), true);
  client.enqueue('new'); await wait(() => !client.busy);
  assert.equal(mock.requests[1].reset, true);
  assert.equal(mock.requests[1].body, '');
  assert.equal(calls.length, 2);
  assert.equal(mock.requests[2].challenged, true);
  assert.equal(mock.requests[2].session, false);
});
test('single/combined length limits preserve queue exactly', async t => {
  const { client, mock } = await fixture(t, { delay: 50 });
  assert.equal(client.enqueue('x'.repeat(1001)), 'too_long');
  client.enqueue('first');
  assert.equal(client.enqueue('x'.repeat(998)), null);
  assert.equal(client.enqueue('y'), null);
  assert.equal(client.enqueue('z'), 'queue_full');
  await wait(() => !client.busy);
  assert.equal(mock.requests[1].message.length, 1000);
});
test('missing/invalid token rejected by mock; unexpected API paths stay closed', async t => {
  const { mock } = await fixture(t);
  for (const [token, error] of [[null,'challenge_required'], ['invalid','challenge_failed']]) {
    const res = await fetch(mock.origin + '/api/external/web/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'X-PowOrg-Turnstile': token } : {}) }, body: JSON.stringify({ message: 'test' }) });
    assert.equal(res.status, 403); assert.equal((await res.json()).error, error);
  }
  assert.equal((await fetch(mock.origin + '/api/external/web/diagnostics')).status, 404);
});
test('test site key is loopback only; public hosts always receive real public key', () => {
  for (const host of ['127.0.0.1','localhost','[::1]']) assert.equal(siteKey(host), '1x00000000000000000000AA');
  for (const host of ['poworg.com','www.poworg.com','localhost.evil.test']) assert.equal(siteKey(host), '0x4AAAAAAF0Vq3T7yrXacjrJ');
});

test('reset failure preserves transcript work and explicit retry retries reset', async t => {
  const { client, fetcher } = await fixture(t, { plan: [{ status: 503, error: 'unavailable' }] });
  client.enqueue('failed'); client.enqueue('queued'); await wait(() => !client.busy);
  client.fetcher = async () => new Response('unavailable', { status: 503 });
  assert.equal(await client.reset(), false);
  assert.equal(client.failure, 'reset_error');
  assert.equal(client.active[0].message, 'failed');
  assert.equal(client.queue[0].message, 'queued');
  client.fetcher = fetcher;
  assert.equal(await client.retry(), true);
  assert.equal(client.active.length + client.queue.length, 0);
});
test('network loss and malformed replies preserve exact text without automatic replay', async t => {
  for (const fetcher of [async () => { throw new TypeError('Offline'); }, async () => new Response('<html>bad gateway</html>', { status: 502 }), async () => Response.json({ reply: '' })]) {
    const { client } = await fixture(t);
    client.fetcher = fetcher;
    client.enqueue('<img src=x onerror=alert(1)>');
    await wait(() => !client.busy);
    assert.equal(client.failure, 'error');
    assert.equal(client.active[0].message, '<img src=x onerror=alert(1)>');
  }
});
test('local request timeout preserves batch and stops the queue', async t => {
  const { client } = await fixture(t, { delay: 150, client: { timeout: 15 } });
  client.enqueue('slow'); client.enqueue('queued'); await wait(() => !client.busy);
  assert.equal(client.failure, 'timeout');
  assert.equal(client.active[0].message, 'slow');
  assert.equal(client.queue[0].message, 'queued');
});
test('cannot accept a message into a reset that will clear the queue', async t => {
  const { client } = await fixture(t);
  let complete;
  client.fetcher = async () => new Promise(resolve => { complete = () => resolve(new Response(null, { status: 204 })); });
  const resetting = client.reset();
  assert.equal(client.snapshot().resetting, true);
  assert.equal(client.enqueue('keep draft'), 'reset_error');
  complete();
  assert.equal(await resetting, true);
  assert.equal(client.snapshot().resetting, false);
});
