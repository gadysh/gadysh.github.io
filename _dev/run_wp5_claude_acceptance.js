// Claude independent acceptance for WP5-fix F1/F2. Usage: node accept.js <siteDir> <port> <outJson>
const path = require('path'), fs = require('fs'), http = require('http');
const puppeteer = require(path.join(process.env.TEMP, 'node_modules', 'puppeteer-core'));
const [siteDir, port, outJson] = [process.argv[2], +process.argv[3], process.argv[4]];
const base = `http://127.0.0.1:${port}`;
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split('?')[0]);
  if (u.endsWith('/')) u += 'index.html'; else if (!path.extname(u)) u += '/index.html';
  fs.readFile(path.join(siteDir, u), (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': mime[path.extname(u)] || 'application/octet-stream' }); r.end(d); });
});
const results = { started: new Date().toISOString(), siteDir, checks: [], blocked: [] };
const rec = (id, expected, actual, pass) => results.checks.push({ id, expected, actual, pass });

async function newPage(browser, w) {
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: 844 });
  await p.setRequestInterception(true);
  p.on('request', q => { const u = q.url(); if (u.startsWith(base) || u.startsWith('data:')) return q.continue(); results.blocked.push(u); q.abort(); });
  p.logs = []; p.on('console', m => { const t = m.text(); if (t.startsWith('[track]')) p.logs.push(t); });
  return p;
}
const STYLE = ['borderTopWidth', 'borderRadius', 'backgroundColor', 'fontWeight', 'paddingInlineStart', 'minHeight'];

(async () => {
  await new Promise(res => server.listen(port, '127.0.0.1', res));
  const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--no-sandbox'] });
  try {
    // (a) drawer appearance + (b) drawer lang_switch
    for (const pg of ['/', '/en/']) {
      const p = await newPage(browser, 390);
      await p.goto(base + pg + '?debug=track', { waitUntil: 'networkidle0' });
      await p.click('#drawer-toggle-btn'); await new Promise(r => setTimeout(r, 400));
      const st = await p.evaluate(S => {
        const ul = document.querySelector('#mobile-drawer ul.drawer-links-direct');
        const a = [...ul.querySelectorAll('a')]; const lang = a.find(x => x.hasAttribute('hreflang')), sib = a.find(x => !x.hasAttribute('hreflang'));
        const g = el => { const c = getComputedStyle(el); return Object.fromEntries(S.map(k => [k, c[k]])); };
        return { lang: g(lang), sib: g(sib), cls: lang.className };
      }, STYLE);
      rec(`a:${pg}`, 'drawer lang link style == sibling', st, JSON.stringify(st.lang) === JSON.stringify(st.sib) && st.cls === '');
      await p.evaluate(() => window.addEventListener('click', e => e.preventDefault()));
      p.logs.length = 0;
      await p.click('#mobile-drawer ul.drawer-links-direct a[hreflang]'); await new Promise(r => setTimeout(r, 200));
      rec(`b:drawer${pg}`, ['[track] lang_switch'], p.logs.map(l => l.split(' ').slice(0, 2).join(' ')), p.logs.length === 1 && p.logs[0].startsWith('[track] lang_switch '));
      await p.close();
    }
    // (b) header pill, wide viewport
    const p = await newPage(browser, 1280);
    await p.goto(base + '/?debug=track', { waitUntil: 'networkidle0' });
    await p.evaluate(() => window.addEventListener('click', e => e.preventDefault()));
    p.logs.length = 0;
    const pill = await p.evaluateHandle(() => [...document.querySelectorAll('header a.lang-switch[hreflang]')].find(a => a.offsetParent));
    await pill.click(); await new Promise(r => setTimeout(r, 200));
    rec('b:header-pill', ['[track] lang_switch'], p.logs.map(l => l.split(' ').slice(0, 2).join(' ')), p.logs.length === 1 && p.logs[0].startsWith('[track] lang_switch '));
    await p.close();
    // (c) contact_view
    const cases = [
      ['/contact/?from=scenario:recording-to-outputs', 'scenario:recording-to-outputs'],
      ['/contact/?from=jane@example.com', 'other'],
      ['/contact/?from=scenario:recording-to-outputs:jane@example.com', 'scenario:recording-to-outputs'],
      ['/contact/?from=scenario:no-such-slug', 'other'],
      ['/en/contact/?from=menu:all_solutions', 'menu:all_solutions'],
      ['/contact/', ''],
    ];
    for (const [u, exp] of cases) {
      const q = await newPage(browser, 1280);
      await q.goto(base + u + (u.includes('?') ? '&' : '?') + 'debug=track', { waitUntil: 'networkidle0' });
      const cv = q.logs.filter(l => l.startsWith('[track] contact_view '));
      const got = cv.map(l => JSON.parse(l.slice('[track] contact_view '.length)).from);
      const noAt = !q.logs.some(l => l.includes('@'));
      rec(`c:${u}`, { from: exp, count: 1, noAt: true }, { from: got, count: cv.length, noAt, all: q.logs }, cv.length === 1 && got[0] === exp && noAt && !q.logs.some(l => l.includes('form_start')));
      await q.close();
    }
  } finally { await browser.close(); server.close(); }
  results.blocked_cloudflare_or_receiver = results.blocked.filter(u => /cloudflareinsights|script\.google/.test(u));
  results.all_pass = results.checks.every(c => c.pass) && results.blocked_cloudflare_or_receiver.length === 0;
  fs.writeFileSync(outJson, JSON.stringify(results, null, 2));
  console.log(results.checks.map(c => `${c.pass ? 'PASS' : 'FAIL'} ${c.id}`).join('\n'));
  console.log('blocked:', results.blocked.length, 'cf/receiver:', results.blocked_cloudflare_or_receiver.length, 'ALL_PASS:', results.all_pass);
})().catch(e => { console.error(e); process.exit(1); });
