// _dev/run_hero_entry_qa.js
// Hero -> "Two entry paths" continuity (2026-11-01): joined screenshots + overflow / overlap / link checks.
// Usage: node _dev/run_hero_entry_qa.js <built_site_dir>
// Serves the built site on 127.0.0.1:4073, shots go to _dev/shots/hero_entry/.

const http = require('http');
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.resolve(process.argv[2] || path.join(process.env.TEMP, 'hero_entry_build'));
const PUPPETEER = require(path.join(process.env.TEMP, 'node_modules', 'puppeteer-core'));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, 'shots', 'hero_entry');
const PORT = 4073;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'mobile-390', width: 390, height: 844, mobile: true },
  { name: 'mobile-360', width: 360, height: 780, mobile: true }
];
const PAGES = [{ name: 'he', url: '/' }, { name: 'en', url: '/en/' }];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const server = http.createServer((req, res) => {
    let f = path.join(SITE_DIR, decodeURIComponent(req.url.split('?')[0].split('#')[0]));
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    fs.readFile(f, (err, data) => {
      if (err) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
      res.end(data);
    });
  });
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  const browser = await PUPPETEER.launch({ executablePath: CHROME, headless: 'new' });
  const results = [];
  for (const pg of PAGES) {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
      await page.goto(`http://127.0.0.1:${PORT}${pg.url}`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }));
      await page.waitForFunction(() => [...document.querySelectorAll('#entry-paths img')].every(i => i.complete && i.naturalWidth > 0), { timeout: 10000 });
      const r = await page.evaluate(() => {
        const hero = document.querySelector('#hero').getBoundingClientRect();
        const entry = document.querySelector('#entry-paths');
        const er = entry.getBoundingClientRect();
        const links = [...entry.querySelectorAll('a.entry-link')].map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href'), intent: a.dataset.trackIntent, h: Math.round(a.getBoundingClientRect().height) }));
        const rects = [...entry.querySelectorAll('h3, p, a.entry-link, .entry-scene img')].map(e => ({ tag: e.tagName, r: e.getBoundingClientRect() }));
        const overlaps = [];
        for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
          const a = rects[i].r, b = rects[j].r;
          if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) overlaps.push(`${rects[i].tag}x${rects[j].tag}`);
        }
        return {
          heroBottom: Math.round(hero.bottom + scrollY), entryTop: Math.round(er.top + scrollY), entryBottom: Math.round(er.bottom + scrollY),
          hOverflow: document.documentElement.scrollWidth > innerWidth,
          h2: entry.querySelector('h2').textContent.trim(), dir: document.documentElement.dir, links, overlaps,
          h3Size: getComputedStyle(entry.querySelector('h3')).fontSize, pSize: getComputedStyle(entry.querySelector('p')).fontSize
        };
      });
      const shot = path.join(OUT_DIR, `${pg.name}-${vp.name}-hero-entry.png`);
      const top = Math.max(0, r.heroBottom - Math.round(vp.height * (vp.mobile ? 0.9 : 0.75)));
      await page.setViewport({ width: vp.width, height: r.entryBottom + 10, deviceScaleFactor: 1, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
      await page.screenshot({ path: shot, clip: { x: 0, y: 0, width: vp.width, height: r.entryBottom } });
      results.push({ page: pg.name, vp: vp.name, shot, ...r });
      await page.close();
    }
  }
  // Link operation: click the defined-process link and confirm the contact intent survives
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle0' });
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('#entry-paths a[data-track-intent="defined_process"]')]);
  results.push({ clickCheck: page.url(), intentSelect: await page.evaluate(() => { const s = document.querySelector('select, [name*=intent]'); return s ? s.value : null; }) });
  await browser.close();
  server.close();
  fs.writeFileSync(path.join(OUT_DIR, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
