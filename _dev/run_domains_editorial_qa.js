// _dev/run_domains_editorial_qa.js
// Homepage section 3 editorial rows (2026-11-01): section / transition / first-three-sections shots,
// overflow, overlap, link destination, touch-target and type-size checks.
// Usage: node _dev/run_domains_editorial_qa.js <built_site_dir>
// Serves the built site on 127.0.0.1:4074, shots go to _dev/shots/domains_editorial/.

const http = require('http');
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.resolve(process.argv[2] || path.join(process.env.TEMP, 'domains_build'));
const PUPPETEER = require(path.join(process.env.TEMP, 'node_modules', 'puppeteer-core'));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, 'shots', 'domains_editorial');
const PORT = 4074;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 1366 },
  { name: 'tablet-768', width: 768, height: 1024, mobile: true },
  { name: 'mobile-390', width: 390, height: 844, mobile: true },
  { name: 'mobile-360', width: 360, height: 780, mobile: true }
];
const PAGES = [{ name: 'he', url: '/', sec: '#domains' }, { name: 'en', url: '/en/', sec: '#solutions' }];

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
  const hrefs = new Set();
  for (const pg of PAGES) {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
      await page.goto(`http://127.0.0.1:${PORT}${pg.url}`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }));
      await page.waitForFunction(() => [...document.querySelectorAll('#entry-paths img, .domain-row img')].every(i => i.complete && i.naturalWidth > 0), { timeout: 10000 });
      const r = await page.evaluate((sel) => {
        const sec = document.querySelector(sel);
        const sr = sec.getBoundingClientRect();
        const er = document.querySelector('#entry-paths').getBoundingClientRect();
        const box = e => { const b = e.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top + scrollY), b: Math.round(b.bottom + scrollY), w: Math.round(b.width), h: Math.round(b.height) }; };
        const rows = [...sec.querySelectorAll('.domain-row')].map(row => {
          const parts = [...row.querySelectorAll('h3, p, li a, a.domain-row-action, img')];
          const overlaps = [];
          for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
            if (parts[i].contains(parts[j]) || parts[j].contains(parts[i])) continue;
            const a = parts[i].getBoundingClientRect(), b = parts[j].getBoundingClientRect();
            if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) overlaps.push(`${parts[i].tagName}x${parts[j].tagName}`);
          }
          return {
            title: row.querySelector('h3').textContent.trim(),
            img: row.querySelector('img') ? box(row.querySelector('img')) : null,
            text: box(row.querySelector('.domain-row-text')),
            links: [...row.querySelectorAll('a')].map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href'), h: Math.round(a.getBoundingClientRect().height) })),
            overlaps
          };
        });
        return {
          entryBottom: Math.round(er.bottom + scrollY), secTop: Math.round(sr.top + scrollY), secBottom: Math.round(sr.bottom + scrollY),
          hOverflow: document.documentElement.scrollWidth > innerWidth, dir: document.documentElement.dir,
          h2: sec.querySelector('h2').textContent.trim(), note: sec.querySelector('.section-footer-note').textContent.trim(),
          h3Size: getComputedStyle(sec.querySelector('.domain-row h3')).fontSize, pSize: getComputedStyle(sec.querySelector('.domain-row p')).fontSize,
          linkSize: getComputedStyle(sec.querySelector('.domain-row li a')).fontSize, rows
        };
      }, pg.sec);
      r.rows.forEach(row => row.links.forEach(l => hrefs.add(l.href.split('?')[0])));
      await page.setViewport({ width: vp.width, height: r.secBottom + 10, deviceScaleFactor: 1, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
      const shots = {};
      shots.section = path.join(OUT_DIR, `${pg.name}-${vp.name}-domains.png`);
      await page.screenshot({ path: shots.section, clip: { x: 0, y: r.secTop, width: vp.width, height: r.secBottom - r.secTop } });
      const tTop = Math.max(0, r.entryBottom - Math.round(vp.height * 0.55));
      shots.transition = path.join(OUT_DIR, `${pg.name}-${vp.name}-entry-to-domains.png`);
      await page.screenshot({ path: shots.transition, clip: { x: 0, y: tTop, width: vp.width, height: Math.min(r.secBottom, r.entryBottom + Math.round(vp.height * 0.75)) - tTop } });
      if (vp.name === 'desktop-1440') {
        shots.firstThree = path.join(OUT_DIR, `${pg.name}-${vp.name}-first-three-sections.png`);
        await page.screenshot({ path: shots.firstThree, clip: { x: 0, y: 0, width: vp.width, height: r.secBottom } });
      }
      results.push({ page: pg.name, vp: vp.name, shots, ...r });
      await page.close();
    }
  }
  // Destination check: every section link resolves in the built site
  const status = {};
  for (const h of hrefs) {
    status[h] = await new Promise(res => http.get(`http://127.0.0.1:${PORT}${h}`, x => { x.resume(); res(x.statusCode); }).on('error', () => res('ERR')));
  }
  results.push({ linkStatus: status });
  await browser.close();
  server.close();
  fs.writeFileSync(path.join(OUT_DIR, 'results.json'), JSON.stringify(results, null, 2));
  for (const x of results) {
    if (x.linkStatus) { console.log('links', JSON.stringify(x.linkStatus)); continue; }
    const minH = Math.min(...x.rows.flatMap(r => r.links.map(l => l.h)));
    console.log(x.page, x.vp, 'overflow', x.hOverflow, 'overlaps', x.rows.map(r => r.overlaps.length).join('/'), 'minLinkH', minH, 'h3', x.h3Size, 'p', x.pSize, 'a', x.linkSize, 'imgW', x.rows.map(r => r.img && r.img.w).join('/'), 'rows', x.rows.map(r => `${r.title}:${r.links.length}`).join(' | '));
  }
})().catch(e => { console.error(e); process.exit(1); });
