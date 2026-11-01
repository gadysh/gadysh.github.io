// _dev/run_difference_shared_qa.js
// Homepage section 5 "What sets us apart" (difference-shared, 2026-11-01, HE + EN): section and
// scenarios->difference transition shots, overflow, text/image overlap, art side, heading hierarchy, type sizes,
// exact copy, no links/buttons in the section, next-section adjacency.
// Usage: node _dev/run_difference_shared_qa.js <built_site_dir>   (serves on 127.0.0.1:4076, shots -> _dev/shots/difference_shared/)

const http = require('http');
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.resolve(process.argv[2] || path.join(process.env.TEMP, 'difference_build'));
const PUPPETEER = require(path.join(process.env.TEMP, 'node_modules', 'puppeteer-core'));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, 'shots', 'difference_shared');
const PORT = 4076;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.json': 'application/json' };
const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 1366 },
  { name: 'tablet-768', width: 768, height: 1024, mobile: true },
  { name: 'mobile-390', width: 390, height: 844, mobile: true },
  { name: 'mobile-360', width: 360, height: 780, mobile: true }
];
const COPY = {
  he: ['מה מבדיל אותנו', 'הבנה של AI', 'מה מודלים יודעים לעשות היום, איפה הם טועים, ואיך בונים סביבם בקרה.', 'היכרות עם העבודה בארגון', 'תהליכים, הרשאות, חריגים ומה שקורה כשהמערכת לא יודעת.', 'פיתוח והטמעה', 'חיבור למערכות הקיימות, בדיקה עם המשתמשים ושיפור אחרי העלייה לאוויר.'],
  en: ['What sets us apart', 'Understanding AI', 'What models can do today, where they make mistakes, and how to build controls around them.', 'Knowing how organizations work', 'Processes, permissions, exceptions, and what happens when the system doesn\u2019t know.'.replace('\u2019', "'"), 'Development and delivery', 'Connecting to existing systems, testing with users, and improving after go-live.']
};
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
      await page.waitForFunction(() => [...document.querySelectorAll('.scenario-row img, .difference-art img')].every(i => i.complete && i.naturalWidth > 0), { timeout: 10000 });
      const r = await page.evaluate(() => {
        const sec = document.querySelector('#difference');
        const prev = sec.previousElementSibling, next = sec.nextElementSibling;
        const box = e => { const b = e.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top + scrollY), b: Math.round(b.bottom + scrollY), w: Math.round(b.width), h: Math.round(b.height) }; };
        const parts = [...sec.querySelectorAll('h2, h3, p, .difference-art img')];
        const overlaps = [];
        for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i].getBoundingClientRect(), b = parts[j].getBoundingClientRect();
          if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) overlaps.push(`${parts[i].tagName}x${parts[j].tagName}`);
        }
        const img = sec.querySelector('.difference-art img'), h2 = sec.querySelector('h2');
        const ib = img.getBoundingClientRect(), hb = h2.getBoundingClientRect(), gb = sec.querySelector('.difference-groups').getBoundingClientRect();
        const sb = sec.getBoundingClientRect(), pb = prev.getBoundingClientRect();
        return {
          dir: document.documentElement.dir, lang: document.documentElement.lang,
          hOverflow: document.documentElement.scrollWidth > innerWidth,
          texts: [...sec.querySelectorAll('h2, h3, p')].map(e => e.textContent.trim()),
          tags: [...sec.querySelectorAll('h2, h3, p')].map(e => e.tagName).join(','),
          interactive: sec.querySelectorAll('a, button, input, select').length,
          idCount: document.querySelectorAll('#difference').length,
          order: ib.top >= hb.bottom - 1 && gb.top >= ib.bottom - 1 ? 'heading>art>groups' : (ib.right <= gb.left + 1 ? 'art-left' : ib.left >= gb.right - 1 ? 'art-right' : 'other'),
          img: box(img), natural: img.naturalWidth + 'x' + img.naturalHeight, alt: img.getAttribute('alt'), artHidden: img.closest('[aria-hidden=true]') !== null,
          overlaps,
          h2Size: getComputedStyle(h2).fontSize, h3Size: getComputedStyle(sec.querySelector('h3')).fontSize, pSize: getComputedStyle(sec.querySelector('p')).fontSize,
          prevId: prev.id, nextId: next.id, prevTop: Math.round(pb.top + scrollY), secTop: Math.round(sb.top + scrollY), secBottom: Math.round(sb.bottom + scrollY),
          prevBg: getComputedStyle(prev).backgroundColor, secBg: getComputedStyle(sec).backgroundImage, nextBg: getComputedStyle(next).backgroundColor,
          animations: getComputedStyle(sec).animationName + '/' + getComputedStyle(img).animationName
        };
      });
      await page.setViewport({ width: vp.width, height: r.secBottom + 400, deviceScaleFactor: 1, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
      const shots = {};
      shots.section = path.join(OUT_DIR, `${pg.name}-${vp.name}-difference.png`);
      await page.screenshot({ path: shots.section, clip: { x: 0, y: r.secTop, width: vp.width, height: r.secBottom - r.secTop } });
      if (vp.name === 'desktop-1440' || vp.name === 'mobile-390') {
        const tTop = Math.max(r.prevTop, r.secTop - Math.round(vp.height * 0.6));
        shots.transition = path.join(OUT_DIR, `${pg.name}-${vp.name}-scenarios-to-difference.png`);
        await page.screenshot({ path: shots.transition, clip: { x: 0, y: tTop, width: vp.width, height: Math.min(r.secBottom + 200, r.secTop + Math.round(vp.height * 1.0)) - tTop } });
      }
      r.copyExact = JSON.stringify(r.texts) === JSON.stringify(COPY[pg.name]);
      results.push({ page: pg.name, vp: vp.name, shots, ...r });
      await page.close();
    }
  }
  await browser.close();
  server.close();
  fs.writeFileSync(path.join(OUT_DIR, 'results.json'), JSON.stringify(results, null, 2));
  for (const x of results) {
    console.log(x.page, x.vp, x.lang, x.dir, 'overflow', x.hOverflow, 'overlaps', x.overlaps.join(',') || 0, 'order', x.order, 'imgW', x.img.w,
      'h2/h3/p', x.h2Size, x.h3Size, x.pSize, 'tags', x.tags, 'copyExact', x.copyExact, 'interactive', x.interactive, 'n#difference', x.idCount,
      'prev', x.prevId, 'next', x.nextId, 'anim', x.animations, 'artHidden', x.artHidden, 'natural', x.natural);
  }
  console.log('bg he', results[0].prevBg, '|', results[0].secBg, '|', results[0].nextBg);
  console.log('bg en', results[5].prevBg, '|', results[5].secBg, '|', results[5].nextBg);
})().catch(e => { console.error(e); process.exit(1); });
