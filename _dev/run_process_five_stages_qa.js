// _dev/run_process_five_stages_qa.js
// Homepage section 6 "How we work" five-stage journey (process-journey, 2026-11-01, HE + EN): section,
// difference->process transition and anchor shots; stage count/order/exact copy, ordered-list semantics,
// visual order (RTL/LTR), overflow, text/image overlap, scene loading, HE onward link, anchor offset under sticky header,
// and fingerprints of #technology/#fit/#founder/#contact-cta/footer for the untouched-sections check.
// Usage: node _dev/run_process_five_stages_qa.js <built_site_dir>   (serves on 127.0.0.1:4077, shots -> _dev/shots/process_five_stages/)

const http = require('http');
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.resolve(process.argv[2] || path.join(process.env.TEMP, 'process_build'));
const PUPPETEER = require(path.join(process.env.TEMP, 'node_modules', 'puppeteer-core'));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, 'shots', 'process_five_stages');
const PORT = 4077;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2' };
const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 1366 },
  { name: 'tablet-768', width: 768, height: 1024, mobile: true },
  { name: 'mobile-390', width: 390, height: 844, mobile: true },
  { name: 'mobile-360', width: 360, height: 780, mobile: true }
];
const COPY = {
  he: { h2: 'איך עובדים', stages: ['היכרות', 'איתור הזדמנויות ותיחום', 'פיתוח וחיבור למערכות', 'הטמעה עם המשתמשים', 'מדידה, שיפור והרחבה'], note: 'הדרך וההיקף נקבעים יחד, לפי הארגון.' },
  en: { h2: 'How we work', stages: ['Introduction', 'Finding opportunities and setting scope', 'Development and system integration', 'Rollout with users', 'Measurement, improvement and expansion'], note: 'The path and scope are set together, based on your organization.' }
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
  let fails = 0;
  try {
    for (const pg of PAGES) {
      for (const vp of VIEWPORTS) {
        const page = await browser.newPage();
        const setVp = h => page.setViewport({ width: vp.width, height: h, deviceScaleFactor: 1, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
        await setVp(vp.height);
        await page.goto(`http://127.0.0.1:${PORT}${pg.url}`, { waitUntil: 'networkidle0' });
        await page.evaluate(async () => {
          document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
          await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
        });
        const r = await page.evaluate(() => {
          const sec = document.getElementById('process');
          const sr = sec.getBoundingClientRect();
          const y = window.scrollY;
          const ol = sec.querySelector('ol.process-stages');
          const lis = [...sec.querySelectorAll('ol.process-stages > li')];
          const box = b => [b.left, b.top, b.right, b.bottom];
          const stages = lis.map(li => {
            const t = li.querySelector('h3'), img = li.querySelector('img'), o = li.querySelector('.process-ordinal');
            const ir = img.getBoundingClientRect();
            return { text: t.textContent.trim(), ord: o.textContent.trim(),
              src: img.currentSrc.split('/').pop(), loaded: img.complete && img.naturalWidth > 0,
              t: box(t.getBoundingClientRect()), i: box(ir), o: box(o.getBoundingClientRect()),
              fontPx: parseFloat(getComputedStyle(t).fontSize), imgW: Math.round(ir.width) };
          });
          const overlap = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
          let textImgOverlap = 0;
          stages.forEach(s => stages.forEach(u => { textImgOverlap += overlap(s.t, u.i); }));
          const footer = sec.querySelector('.process-footer');
          const link = footer.querySelector('a');
          const fp = id => { const e = document.getElementById(id); return e ? e.outerHTML.length + ':' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) : 'missing'; };
          const footEl = document.querySelector('footer');
          return {
            dir: document.documentElement.dir, h2: sec.querySelector('h2').textContent.trim(), labelledby: sec.getAttribute('aria-labelledby'),
            olTag: ol && ol.tagName, liCount: lis.length, stages, textImgOverlap: Math.round(textImgOverlap),
            note: footer.querySelector('p').textContent.trim(), link: link ? { text: link.textContent.trim(), href: link.getAttribute('href') } : null,
            docOverflow: document.documentElement.scrollWidth - window.innerWidth,
            secOverflow: [...sec.querySelectorAll('*')].filter(e => { const b = e.getBoundingClientRect(); return b.right > window.innerWidth + 1 || b.left < -1; }).map(e => e.className || e.tagName).slice(0, 5),
            secTop: Math.round(sr.top + y), secBottom: Math.round(sr.bottom + y),
            diffBottom: Math.round(document.getElementById('difference').getBoundingClientRect().bottom + y),
            nextId: sec.nextElementSibling && sec.nextElementSibling.id,
            fingerprints: { technology: fp('technology'), fit: fp('fit'), founder: fp('founder'), contactCta: fp('contact-cta'), footer: footEl ? footEl.outerHTML.length : 'missing' }
          };
        });
        const c = COPY[pg.name];
        const issues = [];
        if (r.h2 !== c.h2) issues.push('h2 ' + r.h2);
        if (r.olTag !== 'OL' || r.liCount !== 5) issues.push('ol/li ' + r.olTag + ' ' + r.liCount);
        r.stages.forEach((s, k) => {
          if (s.text !== c.stages[k]) issues.push(`stage${k + 1} text "${s.text}"`);
          if (s.ord !== String(k + 1)) issues.push(`stage${k + 1} ordinal ${s.ord}`);
          if (!s.loaded) issues.push(`stage${k + 1} image not loaded`);
          if (s.fontPx < 16) issues.push(`stage${k + 1} font ${s.fontPx}`);
          if (s.i[0] < -1 || s.i[2] > vp.width + 1) issues.push(`stage${k + 1} image clipped by viewport`);
        });
        const desktop = vp.width >= 1024;
        for (let k = 1; k < 5; k++) {
          const a = r.stages[k - 1], b = r.stages[k];
          if (desktop) {
            const ok = pg.name === 'he' ? b.o[0] < a.o[0] : b.o[0] > a.o[0];
            if (!ok || Math.abs(b.o[1] - a.o[1]) > 2) issues.push(`desktop order ${k}->${k + 1}`);
          } else if (!(b.o[1] > a.o[1])) issues.push(`vertical order ${k}->${k + 1}`);
        }
        if (!desktop) r.stages.forEach((a, k) => {
          const ok = pg.name === 'he' ? a.o[0] > a.i[2] : a.o[2] < a.i[0];
          if (!ok) issues.push(`stage${k + 1} side`);
        });
        if (r.textImgOverlap > 0) issues.push('text/image overlap ' + r.textImgOverlap);
        if (r.docOverflow > 0) issues.push('doc overflow ' + r.docOverflow);
        if (r.secOverflow.length) issues.push('section overflow ' + r.secOverflow.join(','));
        if (r.note !== c.note) issues.push('note ' + r.note);
        if (pg.name === 'he' && (!r.link || r.link.href !== '/how-we-work/' || r.link.text !== 'איך עובדים ›')) issues.push('HE link ' + JSON.stringify(r.link));
        if (pg.name === 'en' && r.link) issues.push('EN link unexpected');
        if (r.diffBottom !== r.secTop) issues.push(`gap difference->process ${r.secTop - r.diffBottom}`);

        const base = `${pg.name}-${vp.name}`;
        await setVp(Math.max(vp.height, r.secBottom + 400));
        await page.screenshot({ path: path.join(OUT_DIR, `${base}-section.png`), clip: { x: 0, y: r.secTop, width: vp.width, height: r.secBottom - r.secTop } });
        await page.screenshot({ path: path.join(OUT_DIR, `${base}-transition.png`), clip: { x: 0, y: r.diffBottom - 320, width: vp.width, height: 640 } });

        await setVp(vp.height);
        await page.goto(`http://127.0.0.1:${PORT}${pg.url}#process`, { waitUntil: 'networkidle0' });
        await new Promise(res => setTimeout(res, 900));
        const a = await page.evaluate(() => {
          const h = document.querySelector('header');
          const t = document.querySelector('#process h2').getBoundingClientRect();
          return { headerBottom: Math.round(h.getBoundingClientRect().bottom), h2Top: Math.round(t.top) };
        });
        if (a.h2Top - a.headerBottom < 16) issues.push(`anchor: h2 top ${a.h2Top} vs header bottom ${a.headerBottom}`);
        await page.screenshot({ path: path.join(OUT_DIR, `${base}-anchor.png`) });

        if (pg.name === 'he' && vp.name === 'desktop-1440') {
          const resp = await page.goto(`http://127.0.0.1:${PORT}/how-we-work/`, { waitUntil: 'domcontentloaded' });
          if (resp.status() !== 200) issues.push('HE link target ' + resp.status());
        }
        if (issues.length) fails++;
        results.push({ page: pg.name, vp: vp.name, dir: r.dir, issues, anchor: a, imgs: r.stages.map(s => `${s.src}@${s.imgW}px`), minFont: Math.min(...r.stages.map(s => s.fontPx)), nextId: r.nextId, fingerprints: r.fingerprints, labelledby: r.labelledby });
        console.log(`${pg.name} ${vp.name} dir=${r.dir} ${issues.length ? 'FAIL ' + issues.join(' | ') : 'OK'} anchor(h2Top=${a.h2Top}, headerBottom=${a.headerBottom}) imgs=${r.stages.map(s => s.src + '@' + s.imgW).join(',')} minFont=${Math.min(...r.stages.map(s => s.fontPx))}`);
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
  fs.writeFileSync(path.join(OUT_DIR, 'qa-results.json'), JSON.stringify(results, null, 2));
  console.log(fails ? `${fails} FAILING combinations` : 'ALL OK');
  process.exitCode = fails ? 1 : 0;
})();
