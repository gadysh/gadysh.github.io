// _dev/run_technology_dark_qa.js
// Homepage section 7 "Technology" dark field + nine original logos (2026-11-01, HE + EN): exact copy, 9 named brands,
// logo files loaded and undistorted, chip overflow, copy/art overlap, page overflow, text contrast, #technology anchor
// below the sticky header, no new controls; shots of process->technology->fit adjacency.
// Usage: node _dev/run_technology_dark_qa.js <built_site_dir>   (serves on 127.0.0.1:4078, shots -> _dev/shots/technology_dark/)
const http = require('http');
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.resolve(process.argv[2] || path.join(process.env.TEMP, 'tech_build'));
const PUPPETEER = require(path.join(process.env.TEMP, 'node_modules', 'puppeteer-core'));
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT_DIR = path.join(__dirname, 'shots', 'technology_dark');
const PORT = 4078;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2' };
const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 1366 },
  { name: 'tablet-768', width: 768, height: 1024, mobile: true },
  { name: 'mobile-390', width: 390, height: 844, mobile: true },
  { name: 'mobile-360', width: 360, height: 780, mobile: true }
];
const COPY = {
  he: { h2: 'טכנולוגיה לפי הארגון', p: 'אפשר לבנות את הפתרון על התשתית שלנו, או בענן שהארגון כבר עובד איתו, כמו Google Cloud,\u200f Microsoft Azure או AWS. הבחירה נעשית לפי המערכות, הדרישות והתקציב שלכם.' },
  en: { h2: 'Technology that fits your organization', p: 'We can build the solution on our infrastructure, or in a cloud your organization already uses, such as Google Cloud, Microsoft Azure or AWS. The choice depends on your systems, requirements and budget.' }
};
const BRANDS = ['Google Cloud', 'Microsoft Azure', 'AWS', 'WhatsApp', 'Salesforce', 'Microsoft Dynamics 365', 'SAP', 'Oracle NetSuite', 'Priority'];
const PAGES = [{ name: 'he', url: '/' }, { name: 'en', url: '/en/' }];

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(SITE_DIR, p);
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
});

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  const browser = await PUPPETEER.launch({ executablePath: CHROME, headless: 'new' });
  const fails = [];
  for (const pg of PAGES) for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
    await page.goto(`http://127.0.0.1:${PORT}${pg.url}`, { waitUntil: 'networkidle0' });
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; });
      await new Promise(r => setTimeout(r, 400));
      await Promise.all([...document.querySelectorAll('#technology img')].map(i => i.decode().catch(() => {})));
    });
    const r = await page.evaluate((copy, brands) => {
      const s = document.querySelector('#technology');
      const out = { errs: [] };
      const norm = t => t.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
      const h2 = s.querySelector('h2'), p = s.querySelector('.technology-copy p');
      if (norm(h2.textContent) !== copy.h2) out.errs.push('h2 text: ' + norm(h2.textContent));
      if (norm(p.textContent) !== norm(copy.p)) out.errs.push('p text: ' + norm(p.textContent));
      const names = [...s.querySelectorAll('.tech-logo')].map(li => norm(li.querySelector('img').alt + ' ' + (li.querySelector('span') ? li.querySelector('span').textContent : '')));
      out.names = names;
      brands.forEach(b => { if (!names.includes(b)) out.errs.push('missing brand ' + b); });
      if (names.length !== 9) out.errs.push('tile count ' + names.length);
      s.querySelectorAll('img').forEach(i => {
        if (!i.complete || !i.naturalWidth) out.errs.push('img not loaded ' + i.src);
        const b = i.getBoundingClientRect(); const cs = getComputedStyle(i), lw = parseFloat(cs.width), lh = parseFloat(cs.height);
        const nr = i.naturalWidth / i.naturalHeight, rr = lw / lh;
        if (Math.abs(nr - rr) / nr > 0.03) out.errs.push(`distorted ${i.src.split('/').pop()} ${nr.toFixed(2)} vs ${rr.toFixed(2)}`);
        if (lh < (/google-cloud/.test(i.src) ? 12 : 14) && i.closest('.tech-logo')) out.errs.push('tiny logo ' + i.src.split('/').pop() + ' ' + b.height);
      });
      s.querySelectorAll('.tech-logo').forEach(li => {
        const lb = li.getBoundingClientRect();
        [...li.children].forEach(c => {
          const cb = c.getBoundingClientRect();
          if (cb.left < lb.left - 0.5 || cb.right > lb.right + 0.5 || cb.top < lb.top - 0.5 || cb.bottom > lb.bottom + 0.5) out.errs.push('chip overflow ' + norm(li.textContent) + (c.alt || ''));
        });
      });
      const ov = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      const tiles = [...s.querySelectorAll('.tech-logo')].map(t => { const o = t.style.transform; t.style.transform = 'none'; const r = t.getBoundingClientRect(); t.style.transform = o; return r; });
      for (let i = 0; i < tiles.length; i++) for (let j = i + 1; j < tiles.length; j++) if (ov(tiles[i], tiles[j])) out.errs.push(`tiles overlap ${i},${j}`);
      const copyB = s.querySelector('.technology-copy').getBoundingClientRect();
      [s.querySelector('.tech-scene'), ...s.querySelectorAll('.tech-logo')].forEach(e => { if (ov(copyB, e.getBoundingClientRect())) out.errs.push('copy overlaps art ' + e.className); });
      const sb = s.getBoundingClientRect();
      [...s.querySelectorAll('.technology-copy, .technology-art, .tech-logo')].forEach(e => { const b = e.getBoundingClientRect(); if (b.left < sb.left - 0.5 || b.right > sb.right + 0.5) out.errs.push('section overflow ' + e.className); });
      if (document.documentElement.scrollWidth > window.innerWidth) out.errs.push('page h-overflow ' + document.documentElement.scrollWidth);
      if (s.querySelectorAll('a, button, input, select, textarea, [tabindex]').length) out.errs.push('controls added');
      if (s.querySelectorAll('video, canvas').length) out.errs.push('animation element');
      const lum = c => { const v = c.map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
      const rgb = e => getComputedStyle(e).color.match(/[\d.]+/g).map(Number);
      const field = [[5, 47, 69], [3, 38, 58], [2, 30, 46], [20, 70, 90]];   // field colours incl. the teal glow
      const blend = (c, bg) => (c.length > 3 ? c.slice(0, 3).map((x, i) => x * c[3] + bg[i] * (1 - c[3])) : c);
      out.contrast = {};
      [['h2', h2], ['p', p]].forEach(([k, e]) => {
        out.contrast[k] = Math.min(...field.map(bg => { const c = blend(rgb(e), bg); const L1 = lum(c), L2 = lum(bg); return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); })).toFixed(1);
        if (out.contrast[k] < 7) out.errs.push('contrast ' + k + ' ' + out.contrast[k]);
      });
      out.dir = { copyLeft: Math.round(copyB.left), artLeft: Math.round(s.querySelector('.technology-art').getBoundingClientRect().left) };
      return out;
    }, COPY[pg.name], BRANDS);
    if (vp.width >= 1200) {
      const rtl = pg.name === 'he';
      if (rtl ? r.dir.copyLeft < r.dir.artLeft : r.dir.copyLeft > r.dir.artLeft) r.errs.push('desktop side order wrong ' + JSON.stringify(r.dir));
    }
    const order = await page.evaluate(() => ['process', 'technology'].map(id => document.getElementById(id).nextElementSibling.id).join('>'));
    if (order !== 'technology>fit') r.errs.push('section order ' + order);
    await page.evaluate(() => { location.hash = ''; location.hash = '#technology'; });
    await new Promise(res => setTimeout(res, 800));
    const anchor = await page.evaluate(() => {
      const h = document.querySelector('.site-header, header');
      const hb = h ? h.getBoundingClientRect().bottom : 0;
      return { headerBottom: Math.round(hb), h2Top: Math.round(document.querySelector('#technology h2').getBoundingClientRect().top) };
    });
    if (anchor.h2Top < anchor.headerBottom) r.errs.push('anchor heading under header ' + JSON.stringify(anchor));
    await page.evaluate(() => window.scrollTo(0, 0));
    const el = await page.$('#technology');
    await el.screenshot({ path: path.join(OUT_DIR, `${pg.name}-${vp.name}-technology.png`) });
    const box = await page.evaluate(() => { const s = document.querySelector('#technology').getBoundingClientRect(); return { y: s.top + scrollY, h: s.height }; });
    await page.screenshot({ path: path.join(OUT_DIR, `${pg.name}-${vp.name}-adjacency.png`), captureBeyondViewport: true, clip: { x: 0, y: Math.max(0, box.y - 220), width: vp.width, height: box.h + 440 } }).catch(e => console.log('adjacency shot', e.message));
    console.log(`${pg.name} ${vp.name}: ${r.errs.length ? 'FAIL ' + r.errs.join(' | ') : 'OK'}  contrast h2 ${r.contrast.h2} p ${r.contrast.p}  anchor ${JSON.stringify(anchor)}`);
    if (r.errs.length) fails.push(pg.name + ' ' + vp.name);
    await page.close();
  }
  await browser.close();
  server.close();
  console.log(fails.length ? 'FAILURES: ' + fails.join(', ') : 'ALL OK');
})();
