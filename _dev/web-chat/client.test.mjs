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
  const errors = [];
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
  const client = new WebChatClient({ challenge, fetcher, onReply: reply => replies.push(reply), onError: code => errors.push(code), ...options.client });
  t.after(() => clearTimeout(client.wakeTimer));
  return { mock, client, replies, errors, calls, challenge, fetcher, resets: () => resets };
}

const refusal = 'התוכן שנשלח נמצא לא תקין';

test('serialized messages retain their boundaries and the HttpOnly session', async t => {
  const { client, mock, replies, calls } = await fixture(t, { delay: 30 });
  client.enqueue('first'); client.enqueue('second\nline'); client.enqueue('third');
  assert.equal(await client.reset(), false);
  await wait(() => !client.busy && !client.queue.length);
  assert.deepEqual(mock.requests.map(r => r.message), ['first','second\nline','third']);
  assert.deepEqual(mock.requests.map(r => r.challenged), [true,false,false]);
  assert.equal(mock.requests[2].session, true);
  assert.equal(calls.length, 1); assert.equal(replies.length, 3);
});

test('a typed first-turn refusal is a completed answer; queued valid turns follow once in the same session', async t => {
  const { client, mock, replies, errors } = await fixture(t, { plan: [{ reply: refusal, outcome: 'content_rejected' }], delay: 30 });
  client.enqueue('blocked'); client.enqueue('valid one'); client.enqueue('valid two');
  await wait(() => !client.busy && !client.queue.length);
  assert.deepEqual(mock.requests.map(r => r.message), ['blocked','valid one','valid two']);
  assert.equal(replies[0], refusal); assert.equal(errors.length, 0);
  assert.equal(mock.requests[1].session, true); assert.equal(mock.requests[2].session, true);
  assert.equal(client.failure, null); assert.equal(client.snapshot().pending, 0);
  assert.equal(mock.requests.some(r => r.reset), false);
});

test('valid, blocked, valid already waiting retain order without batching or discarding', async t => {
  const { client, mock, replies, errors } = await fixture(t, { plan: [{}, { reply: refusal, outcome: 'content_rejected' }, {}], delay: 25 });
  client.enqueue('valid before'); client.enqueue('blocked'); client.enqueue('valid after');
  await wait(() => !client.busy && !client.queue.length);
  assert.deepEqual(mock.requests.map(r => r.message), ['valid before','blocked','valid after']);
  assert.equal(replies.length, 3); assert.equal(replies[1], refusal); assert.equal(errors.length, 0);
});

test('consecutive refusals do not poison a later new submission', async t => {
  const { client, mock, replies } = await fixture(t, { plan: [{ reply: refusal, outcome: 'content_rejected' }, { reply: refusal, outcome: 'content_rejected' }] });
  client.enqueue('blocked one'); client.enqueue('blocked two');
  await wait(() => !client.busy && !client.queue.length);
  client.enqueue('valid'); await wait(() => !client.busy);
  assert.deepEqual(mock.requests.map(r => r.message), ['blocked one','blocked two','valid']);
  assert.deepEqual(replies.slice(0,2), [refusal,refusal]); assert.equal(replies.length,3);
});

test('normal 200 answers, even refusal-like prose or unknown metadata, are not classified by client text matching', async t => {
  const reply = 'Example text mentioning blocked content, not a transport error.';
  const { client, replies, errors } = await fixture(t, { plan: [{ reply, outcome: 'future_value' }] });
  client.enqueue('example'); await wait(() => !client.busy);
  assert.deepEqual(replies,[reply]); assert.deepEqual(errors,[]);
});

test('expired cookie challenge refresh retries the exact request once', async t => {
  const { client, mock, calls } = await fixture(t, { plan: [{}, { status:403, error:'challenge_required', expire:true }] });
  client.enqueue('first'); await wait(() => !client.busy);
  client.enqueue('next'); await wait(() => !client.busy);
  assert.deepEqual(mock.requests.map(r => r.message), ['first','next','next']);
  assert.deepEqual(calls, [{fresh:false},{fresh:true}]);
});

test('repeated challenge requirement stops replaying that turn and preserves later messages', async t => {
  const { client, mock, errors, replies } = await fixture(t, { plan: [{status:403,error:'challenge_required'},{status:403,error:'challenge_required'}] });
  client.enqueue('first'); client.enqueue('next'); await wait(() => !client.busy && !client.queue.length);
  assert.deepEqual(mock.requests.map(r=>r.message),['first','first','next']);
  assert.deepEqual(errors,['challenge_required']); assert.equal(replies.length,1);
});

for (const [status, code, expected] of [[403,'challenge_failed','challenge_failed'],[403,'forbidden','error'],[409,'busy','busy'],[503,'unavailable','unavailable'],[404,'not_found','unavailable'],[502,'agent_error','agent_error'],[504,'timeout','timeout']]) {
  test(`${status} ${code} stays technical; no replay and valid follow-up is not lost`, async t=>{
    const {client,mock,errors,replies}=await fixture(t,{plan:[{status,error:code}]});
    client.enqueue('failed'); client.enqueue('valid'); await wait(()=>!client.busy&&!client.queue.length);
    assert.deepEqual(mock.requests.map(r=>r.message),['failed','valid']);
    assert.deepEqual(errors,[expected]); assert.equal(replies.length,1);
    assert.equal(client.snapshot().pending,0);
  });
}

test('Retry-After delays pending turns without replaying the rate-limited turn', async t=>{
  let now=0;
  const {client,mock,errors}=await fixture(t,{plan:[{status:429,error:'rate_limited',headers:{'Retry-After':'17'}}],client:{now:()=>now}});
  client.enqueue('limited'); client.enqueue('queued valid'); await wait(()=>!client.busy);
  assert.equal(client.enqueue('keep draft'),'cooldown'); assert.equal(client.snapshot().retrySeconds,17);
  assert.equal(client.queue[0].message,'queued valid'); assert.equal(mock.requests.length,1);
  now=17000; await client.run(); await wait(()=>!client.busy);
  assert.deepEqual(mock.requests.map(r=>r.message),['limited','queued valid']); assert.deepEqual(errors,['rate_limited']);
});

test('a real cooldown wakes pending messages without a customer control', async t=>{
  const {client,mock}=await fixture(t,{plan:[{status:429,error:'rate_limited',headers:{'Retry-After':'1'}}]});
  client.enqueue('limited'); client.enqueue('valid');
  await wait(()=>mock.requests.length===2&&!client.busy);
  assert.deepEqual(mock.requests.map(r=>r.message),['limited','valid']);
});

for(const code of ['session_limit','budget_exhausted']) {
  test(`${code} preserves pending messages and draft while enforcing the server cap`,async t=>{
    const {client,mock,errors}=await fixture(t,{plan:[{status:429,error:code}]});
    client.enqueue('first'); client.enqueue('pending'); await wait(()=>!client.busy);
    assert.equal(client.enqueue('keep draft'),code); assert.equal(mock.requests.length,1);
    assert.equal(client.queue[0].message,'pending'); assert.deepEqual(errors,[code]);
  });
}

test('limits preserve accepted messages and refuse empty or oversized drafts',async t=>{
  const {client,mock}=await fixture(t,{delay:25});
  assert.equal(client.enqueue(' '),'empty'); assert.equal(client.enqueue('x'.repeat(1001)),'too_long');
  client.enqueue('first'); assert.equal(client.enqueue('x'.repeat(998)),null); assert.equal(client.enqueue('y'),null); assert.equal(client.enqueue('z'),'queue_full');
  await wait(()=>!client.busy&&!client.queue.length);
  assert.deepEqual(mock.requests.map(r=>r.message.length),[5,998,1]);
});

test('network loss, malformed replies and timeout finish only the affected turn without replay',async t=>{
  for(const failure of [async()=>{throw new TypeError('Offline');},async()=>new Response('<html>bad</html>',{status:502}),async()=>Response.json({reply:''}),async()=>{throw new DOMException('Timed out','TimeoutError');}]) {
    const {client,errors}=await fixture(t);const replies=[];let n=0;
    client.fetcher=async()=>++n===1?failure():Response.json({reply:'valid answer'});client.onReply=r=>replies.push(r);
    client.enqueue('uncertain'); client.enqueue('valid'); await wait(()=>!client.busy&&!client.queue.length);
    assert.equal(n,2);assert.equal(errors.length,1);assert.deepEqual(replies,['valid answer']);
  }
});

test('reset is bodyless, clears only on 204, and preserves a failed-reset conversation',async t=>{
  const {client,mock,fetcher,calls,errors}=await fixture(t,{plan:[{status:429,error:'session_limit'}]});
  client.enqueue('limited');client.enqueue('pending');await wait(()=>!client.busy);
  client.fetcher=async()=>new Response(null,{status:503});assert.equal(await client.reset(),false);
  assert.equal(client.queue[0].message,'pending');assert.equal(client.enqueue('keep draft'),'reset_error');assert.equal(errors.at(-1),'reset_error');
  client.fetcher=fetcher;assert.equal(await client.reset(),true);assert.equal(client.snapshot().pending,0);
  assert.equal(mock.requests.at(-1).reset,true);assert.equal(mock.requests.at(-1).body,'');
  client.enqueue('new');await wait(()=>!client.busy);assert.equal(mock.requests.at(-1).session,false);assert.equal(calls.length,2);
});

test('a pending reset cannot accept a draft that would be cleared',async t=>{
  const {client}=await fixture(t);let done;
  client.fetcher=async()=>new Promise(resolve=>{done=()=>resolve(new Response(null,{status:204}));});
  const reset=client.reset();assert.equal(client.enqueue('keep draft'),'reset_error');done();assert.equal(await reset,true);
});

test('mock rejects missing/invalid tokens and unexpected API paths',async t=>{
  const {mock}=await fixture(t);
  for(const [token,error] of [[null,'challenge_required'],['invalid','challenge_failed']]) {
    const r=await fetch(mock.origin+'/api/external/web/messages',{method:'POST',headers:{'Content-Type':'application/json',...(token?{'X-PowOrg-Turnstile':token}:{})},body:JSON.stringify({message:'test'})});
    assert.equal(r.status,403);assert.equal((await r.json()).error,error);
  }
  assert.equal((await fetch(mock.origin+'/api/external/web/diagnostics')).status,404);
});

test('test key is loopback only; public hosts always use the public production key',()=>{
  for(const h of ['127.0.0.1','localhost','[::1]'])assert.equal(siteKey(h),'1x00000000000000000000AA');
  for(const h of ['poworg.com','www.poworg.com','localhost.evil.test'])assert.equal(siteKey(h),'0x4AAAAAAF0Vq3T7yrXacjrJ');
});
