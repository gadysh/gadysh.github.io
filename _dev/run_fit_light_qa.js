// _dev/run_fit_light_qa.js
// Homepage section 8 "Who it fits" on warm ivory (2026-11-01, HE + EN): exact copy and four items, scene image loaded
// at native quality, reading side (copy right in HE / left in EN at >=1200px), copy/art overlap, page overflow,
// text contrast, #fit anchor below the sticky header, no controls inside #fit, technology->fit->founder adjacency.
// Usage: node _dev/run_fit_light_qa.js [base_url]   (default http://localhost:4000, shots -> _dev/shots/fit_light/)
const fs = require('fs');
const path = require('path');
const PUPPETEER = require(path.join(process.env.TEMP, 'node_modules', 'puppeteer-core'));
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.argv[2] || 'http://localhost:4000';
const OUT_DIR = path.join(__dirname, 'shots', 'fit_light');
const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 1366 },
  { name: 'tablet-768', width: 768, height: 1024, mobile: true },
  { name: 'mobile-390', width: 390, height: 844, mobile: true },
  { name: 'mobile-360', width: 360, height: 780, mobile: true }
];
const COPY = {
  he: { h2: 'למי זה מתאים', intro: 'מתאים במיוחד לארגונים ש־', items: ['יש בהם עבודה אנושית משמעותית שחוזרת על עצמה', 'יש מי שמוביל את המהלך מבפנים', 'יש אחראי מחשוב או ספק מערכות זמין', 'מוכנים להנגיש מידע ולהשקיע במהלך'], note: 'גודל הארגון פחות חשוב. אפשר להגיע גם בלי בעיה מוגדרת.' },
  en: { h2: 'Who it fits', intro: 'Especially organizations that', items: ['have significant repetitive human work', 'have someone leading the effort from inside', 'have an IT owner or systems vendor available', 'are ready to make information accessible and invest in the effort'], note: 'Company size matters less. You can also come without a defined problem.' }
};
const PAGES = [{ name: 'he', url: '/' }, { name: 'en', url: '/en/' }];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await PUPPETEER.launch({ executablePath: CHROME, headless: 'new' });
  let fails = 0;
  const lines = [];
  for (const pg of PAGES) for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
    await page.goto(BASE + pg.url, { waitUntil: 'networkidle0' });
    await page.evaluate(async () => { document.querySelector('#fit').scrollIntoView(); await new Promise(r => setTimeout(r, 400)); });
    const r = await page.evaluate((C) => {
      const s = document.querySelector('#fit');
      const t = el => el.textContent.replace(/\s+/g, ' ').trim();
      const img = s.querySelector('.fit-scene');
      const rect = el => el.getBoundingClientRect();
      const lum = c => { const m = c.match(/[\d.]+/g).map(Number).slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]; };
      const fieldL = lum('rgb(252,242,229)');
      const contrast = el => { const L = lum(getComputedStyle(el).color); return (Math.max(L, fieldL) + 0.05) / (Math.min(L, fieldL) + 0.05); };
      const copyEls = [s.querySelector('.fit-head'), s.querySelector('.fit-list'), s.querySelector('.fit-note')];
      const art = rect(s.querySelector('.fit-art'));
      const overlap = copyEls.some(e => { const b = rect(e); return !(b.right <= art.left || b.left >= art.right || b.bottom <= art.top || b.top >= art.bottom); });
      const sec = rect(s);
      const head = rect(s.querySelector('.fit-head'));
      const prev = s.previousElementSibling, next = s.nextElementSibling;
      return {
        h2: t(s.querySelector('h2')) === C.h2, intro: t(s.querySelector('.fit-intro')) === C.intro,
        items: JSON.stringify([...s.querySelectorAll('.fit-list > li')].map(t)) === JSON.stringify(C.items),
        note: t(s.querySelector('.fit-note')) === C.note,
        img: img.complete && img.naturalWidth > 0, imgSrc: img.currentSrc.split('/').pop(), natW: img.naturalWidth, renderW: Math.round(rect(img).width), dpr: devicePixelRatio,
        overlap, hOverflow: document.documentElement.scrollWidth > innerWidth,
        copySide: head.left + head.width / 2 > art.left + art.width / 2 ? 'right' : 'left', sideBySide: !(art.top >= head.bottom - 1),
        minContrast: Math.min(...[s.querySelector('h2'), s.querySelector('.fit-intro'), ...s.querySelectorAll('.fit-list li'), s.querySelector('.fit-note')].map(contrast)).toFixed(2),
        controls: s.querySelectorAll('a,button,input,select,textarea,[tabindex]').length,
        prevId: prev && prev.id, nextId: next && next.id,
        gapPrev: Math.round(sec.top - rect(prev).bottom), gapNext: Math.round(rect(next).top - sec.bottom)
      };
    }, COPY[pg.name]);
    // anchor below sticky header
    await page.evaluate(() => { location.hash = ''; location.hash = '#fit'; });
    await new Promise(r => setTimeout(r, 500));
    const anchor = await page.evaluate(() => { const h = document.querySelector('header, .site-header'); const hb = h ? h.getBoundingClientRect().bottom : 0; return { h2Top: Math.round(document.querySelector('#fit h2').getBoundingClientRect().top), headerBottom: Math.round(hb) }; });
    const ok = r.h2 && r.intro && r.items && r.note && r.img && !r.overlap && !r.hOverflow && r.controls === 0 && anchor.h2Top >= anchor.headerBottom && r.prevId === 'technology' && r.nextId === 'founder' && r.gapPrev === 0 && r.gapNext === 0 && +r.minContrast >= 4.5
      && (vp.width >= 1200 ? r.sideBySide && r.copySide === (pg.name === 'he' ? 'right' : 'left') : !r.sideBySide);
    if (!ok) fails++;
    lines.push(`${ok ? 'PASS' : 'FAIL'} ${pg.name} ${vp.name} ${JSON.stringify(r)} anchor=${JSON.stringify(anchor)}`);
    const el = await page.$('#fit');
    await page.evaluate(() => window.scrollTo(0, 0));
    await el.screenshot({ path: path.join(OUT_DIR, `${pg.name}-${vp.name}-fit.png`) });
    // adjacency shot: end of technology, fit start / fit end, founder start
    const box = await page.evaluate(() => { const a = document.querySelector('#fit').getBoundingClientRect(); return { top: a.top + scrollY, bottom: a.bottom + scrollY }; });
    for (const [tag, y] of [['tech-fit', box.top - 160], ['fit-founder', box.bottom - 240]]) {
      await page.screenshot({ path: path.join(OUT_DIR, `${pg.name}-${vp.name}-${tag}.png`), clip: { x: 0, y: Math.max(0, y), width: vp.width, height: 400 }, captureBeyondViewport: true });
    }
    await page.close();
  }
  await browser.close();
  console.log(lines.join('\n'));
  console.log(fails ? `${fails} FAIL` : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})();
