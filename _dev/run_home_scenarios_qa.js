// _dev/run_home_scenarios_qa.js
// Homepage section 4 scenario teaser rows (2026-11-01, HE + EN): section / domains->scenarios transition shots,
// overflow, overlap, destinations, EN contact context, heading/section counts, type and touch-target checks.
// Usage: node _dev/run_home_scenarios_qa.js <built_site_dir>
// Serves the built site on 127.0.0.1:4075, shots go to _dev/shots/home_scenarios/.

const http = require('http');
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.resolve(process.argv[2] || path.join(process.env.TEMP, 'scenarios_build'));
const PUPPETEER = require(path.join(process.env.TEMP, 'node_modules', 'puppeteer-core'));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, 'shots', 'home_scenarios');
const PORT = 4075;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.json': 'application/json' };

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 1366 },
  { name: 'tablet-768', width: 768, height: 1024, mobile: true },
  { name: 'mobile-390', width: 390, height: 844, mobile: true },
  { name: 'mobile-360', width: 360, height: 780, mobile: true }
];
const PAGES = [{ name: 'he', url: '/', prev: '#domains' }, { name: 'en', url: '/en/', prev: '#solutions' }];

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
      await page.waitForFunction(() => [...document.querySelectorAll('.domain-row img, .scenario-row img')].every(i => i.complete && i.naturalWidth > 0), { timeout: 10000 });
      const r = await page.evaluate((prevSel) => {
        const sec = document.querySelector('#scenarios');
        const prev = document.querySelector(prevSel);
        const box = e => { const b = e.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top + scrollY), b: Math.round(b.bottom + scrollY), w: Math.round(b.width), h: Math.round(b.height) }; };
        const rows = [...sec.querySelectorAll('.scenario-row')].map(row => {
          const parts = [...row.querySelectorAll('h3, p, a.scenario-row-action, img')];
          const overlaps = [];
          for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
            if (parts[i].contains(parts[j]) || parts[j].contains(parts[i])) continue;
            const a = parts[i].getBoundingClientRect(), b = parts[j].getBoundingClientRect();
            if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) overlaps.push(`${parts[i].className || parts[i].tagName}x${parts[j].className || parts[j].tagName}`);
          }
          const a = row.querySelector('a.scenario-row-action');
          const img = row.querySelector('img'), rb = row.getBoundingClientRect(), ib = img.getBoundingClientRect();
          const hb = row.querySelector('h3').getBoundingClientRect();
          return {
            title: row.querySelector('h3').textContent.trim(),
            outcome: row.querySelector('.scenario-row-outcome').textContent.trim(),
            tag: row.querySelector('.scenario-row-tag').textContent.trim(),
            img: box(img), imgInsideRow: ib.left >= rb.left - 1 && ib.right <= rb.right + 1,
            imgSide: ib.right <= hb.left + 1 ? 'L' : ib.left >= hb.right - 1 ? 'R' : 'S',
            link: { text: a.textContent.trim(), href: a.getAttribute('href'), h: Math.round(a.getBoundingClientRect().height), w: Math.round(a.getBoundingClientRect().width), describedby: a.getAttribute('aria-describedby') },
            overlaps
          };
        });
        const ids = [...document.querySelectorAll('main section[id]')].map(s => s.id);
        const sb = sec.getBoundingClientRect(), pb = prev.getBoundingClientRect();
        return {
          sectionOrder: ids, scenariosCount: document.querySelectorAll('#scenarios').length,
          prevTop: Math.round(pb.top + scrollY), secTop: Math.round(sb.top + scrollY), secBottom: Math.round(sb.bottom + scrollY),
          prevBg: getComputedStyle(prev).backgroundColor, secBg: getComputedStyle(sec).backgroundImage,
          hOverflow: document.documentElement.scrollWidth > innerWidth, dir: document.documentElement.dir, lang: document.documentElement.lang,
          h2: sec.querySelector('h2').textContent.trim(), h2Count: sec.querySelectorAll('h2').length, h3Count: sec.querySelectorAll('h3').length,
          h3Size: getComputedStyle(sec.querySelector('.scenario-row h3')).fontSize, pSize: getComputedStyle(sec.querySelector('.scenario-row-outcome')).fontSize,
          aSize: getComputedStyle(sec.querySelector('.scenario-row-action')).fontSize,
          langSwitch: [...document.querySelectorAll('a[hreflang]')].map(a => a.getAttribute('href')),
          rows
        };
      }, pg.prev);
      r.rows.forEach(row => hrefs.add(row.link.href));
      await page.setViewport({ width: vp.width, height: r.secBottom + 10, deviceScaleFactor: 1, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
      const shots = {};
      shots.section = path.join(OUT_DIR, `${pg.name}-${vp.name}-scenarios.png`);
      await page.screenshot({ path: shots.section, clip: { x: 0, y: r.secTop, width: vp.width, height: r.secBottom - r.secTop } });
      if (vp.name === 'desktop-1440' || vp.name === 'mobile-390') {
        const tTop = Math.max(r.prevTop, r.secTop - Math.round(vp.height * 0.9));
        shots.transition = path.join(OUT_DIR, `${pg.name}-${vp.name}-domains-to-scenarios.png`);
        await page.screenshot({ path: shots.transition, clip: { x: 0, y: tTop, width: vp.width, height: Math.min(r.secBottom, r.secTop + Math.round(vp.height * 0.9)) - tTop } });
      }
      results.push({ page: pg.name, vp: vp.name, shots, ...r });
      await page.close();
    }
  }
  // Destinations: HE scenario pages exist; EN contact receives and shows the scenario context
  const status = {};
  for (const h of hrefs) {
    status[h] = await new Promise(res => http.get(`http://127.0.0.1:${PORT}${h.split('?')[0]}`, x => { x.resume(); res(x.statusCode); }).on('error', () => res('ERR')));
  }
  const ctx = {};
  for (const h of [...hrefs].filter(h => h.startsWith('/en/contact/'))) {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.goto(`http://127.0.0.1:${PORT}${h}`, { waitUntil: 'networkidle0' });
    ctx[h] = await page.evaluate(() => ({
      barVisible: !document.getElementById('contact-context-bar').classList.contains('is-hidden'),
      topic: document.getElementById('context-topic-name').textContent.trim(),
      type: (document.getElementById('hidden-context-type') || {}).value, slug: (document.getElementById('hidden-context-slug') || {}).value,
      lang: document.documentElement.lang
    }));
    if (h.endsWith('whatsapp-service-actions')) await page.screenshot({ path: path.join(OUT_DIR, 'en-contact-context-390.png') });
    await page.close();
  }
  results.push({ linkStatus: status, enContext: ctx });
  await browser.close();
  server.close();
  fs.writeFileSync(path.join(OUT_DIR, 'results.json'), JSON.stringify(results, null, 2));
  for (const x of results) {
    if (x.linkStatus) { console.log('links', JSON.stringify(x.linkStatus)); console.log('enContext', JSON.stringify(x.enContext)); continue; }
    console.log(x.page, x.vp, x.dir, 'overflow', x.hOverflow, 'overlaps', x.rows.map(r => r.overlaps.join(',') || 0).join('/'), 'imgInside', x.rows.every(r => r.imgInsideRow),
      'imgSide', x.rows.map(r => r.imgSide).join(''), 'linkHxW', x.rows.map(r => r.link.h + 'x' + r.link.w).join(','),
      'h3', x.h3Size, 'p', x.pSize, 'a', x.aSize, 'imgW', x.rows.map(r => r.img.w).join('/'), 'h2', x.h2, 'h2n', x.h2Count, 'h3n', x.h3Count, 'n#scenarios', x.scenariosCount);
  }
  for (const x of [results.find(x => x.page === 'he'), results.find(x => x.page === 'en')]) {
    console.log(x.page, 'sections', x.sectionOrder.join('>'), 'langSwitch', x.langSwitch.join(' '), 'prevBg', x.prevBg);
    x.rows.forEach(r => console.log(' ', r.title, '|', r.tag, '|', r.link.text, '->', r.link.href, 'describedby', r.link.describedby));
  }
})().catch(e => { console.error(e); process.exit(1); });
