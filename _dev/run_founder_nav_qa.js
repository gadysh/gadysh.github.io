// _dev/run_founder_nav_qa.js
// #founder notebook + shared biography + header "On this page" navigation (2026-11-01, HE + EN).
// Checks: bio text equality home #founder vs how-we-work #about per language, no stale "2025", art loaded at native size,
// reading/art sides, overflow, ten section links, desktop flyout open/Escape/outside/selection, solutions/page flyout
// exclusivity, phone drawer open/scroll/section jump/close, anchors land below sticky header, inner-page links.
// Usage: node _dev/run_founder_nav_qa.js [base_url]   (shots -> _dev/shots/founder_nav/)
const fs = require('fs');
const path = require('path');
const PUPPETEER = require(path.join(process.env.TEMP, 'node_modules', 'puppeteer-core'));
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.argv[2] || 'http://localhost:4000';
const OUT = path.join(__dirname, 'shots', 'founder_nav');
fs.mkdirSync(OUT, { recursive: true });
const VPS = [
  { name: '1440', width: 1440, height: 900 }, { name: '1024', width: 1024, height: 900 },
  { name: '768', width: 768, height: 1024, mobile: true }, { name: '390', width: 390, height: 844, mobile: true },
  { name: '360', width: 360, height: 780, mobile: true }
];
const LANGS = [{ l: 'he', home: '/', about: '/how-we-work/' }, { l: 'en', home: '/en/', about: '/en/how-we-work/' }];
const norm = s => s.replace(/\s+/g, ' ').trim();
const fails = [], log = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); ok || fails.push(msg); };
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await PUPPETEER.launch({ executablePath: CHROME, headless: 'new' });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  for (const L of LANGS) {
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE + L.home, { waitUntil: 'networkidle0' });
    const homeBio = norm(await page.$eval('#founder .founder-bio', el => Array.from(el.querySelectorAll('p')).map(p => p.textContent).join(' ')));
    await page.goto(BASE + L.about, { waitUntil: 'networkidle0' });
    const aboutBio = norm(await page.$eval('#about', el => Array.from(el.querySelectorAll('.lead-line')).map(p => p.textContent).join(' ')));
    const aboutTxt = await page.$eval('#about', el => el.innerText);
    log(homeBio === aboutBio, `${L.l} bio equal home/about: "${homeBio}"`);
    log(!/2025/.test(aboutTxt + homeBio), `${L.l} no 2025`);
    log(L.l === 'he' ? homeBio.includes('איתור התהליכים') : homeBio.includes('identifying processes'), `${L.l} process-identification sentence`);
    log(L.l === 'he' ? aboutTxt.includes('איך אנחנו עובדים עם סוכני') : aboutTxt.includes('How we work with AI agents ourselves'), `${L.l} about agents text kept`);
    log(await page.$('#contact-cta') !== null && await page.$('footer') !== null, `${L.l} about CTA + footer present`);
    const ab = await page.$('#about'); await ab.screenshot({ path: path.join(OUT, `${L.l}-about-1440.png`) });
    const innerHrefs = await page.$$eval('#page-menu a', as => as.map(a => a.getAttribute('href')));
    log(innerHrefs.length === 10 && innerHrefs.every(h => h.startsWith(L.home + '#')), `${L.l} inner-page 10 links to ${L.home}#... (${innerHrefs.join(' ')})`);
    const hww = await page.$$eval('.nav-desktop a.nav-link', as => as.map(a => a.textContent.trim() + '=' + a.getAttribute('href')));
    console.log('     header links: ' + hww.join(' | '));

    for (const vp of VPS) {
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
      await page.goto(BASE + L.home, { waitUntil: 'networkidle0' });
      await page.$eval('#founder .founder-notebook-art img', img => img.scrollIntoView());
      await page.waitForFunction(() => { const i = document.querySelector('#founder .founder-notebook-art img'); return i.complete && i.naturalWidth > 0; }, { timeout: 5000 }).catch(() => {});
      const r = await page.evaluate(() => {
        const f = document.getElementById('founder'), img = f.querySelector('.founder-notebook-art img');
        const rb = f.querySelector('.founder-notebook-body').getBoundingClientRect(), ra = img.getBoundingClientRect(), rh = f.querySelector('.founder-notebook-head').getBoundingClientRect();
        const overlap = !(rb.right <= ra.left || rb.left >= ra.right || rb.bottom <= ra.top || rb.top >= ra.bottom);
        return { loaded: img.complete && img.naturalWidth === 876, overflow: document.documentElement.scrollWidth > innerWidth, overlap, bodyRight: rb.left > ra.left, headAbove: rh.bottom <= ra.top + 1, artAboveBody: ra.bottom <= rb.top + 1, artW: Math.round(ra.width), fs: parseFloat(getComputedStyle(f.querySelector('.founder-bio p')).fontSize), links: document.querySelectorAll('#page-menu a').length, drawerLinks: document.querySelectorAll('.drawer-section-links a').length, hdrH: document.querySelector('.site-header').getBoundingClientRect().height };
      });
      log(r.loaded && !r.overflow && !r.overlap && r.fs >= 17, `${L.l}@${vp.name} art loaded (shown ${r.artW}px)/no overflow/no overlap/font ${r.fs}px, header ${r.hdrH}px`);
      if (vp.width >= 768) log(L.l === 'he' ? r.bodyRight : !r.bodyRight, `${L.l}@${vp.name} reading side ${L.l === 'he' ? 'right' : 'left'}`);
      else log(r.headAbove && r.artAboveBody, `${L.l}@${vp.name} phone order heading/art/body`);
      log(r.links === 10 && r.drawerLinks === 10, `${L.l}@${vp.name} ten links in flyout + drawer`);
      const s = await page.$('#founder');
      await s.screenshot({ path: path.join(OUT, `${L.l}-founder-${vp.name}.png`) });

      if (vp.width >= 1024) {
        await page.evaluate(() => scrollTo(0, 0)); await wait(100);
        await page.click('#page-menu-btn');
        let st = await page.evaluate(() => ({ e: document.getElementById('page-menu-btn').getAttribute('aria-expanded'), v: getComputedStyle(document.getElementById('page-menu')).display }));
        log(st.e === 'true' && st.v === 'block', `${L.l}@${vp.name} flyout opens`);
        await page.screenshot({ path: path.join(OUT, `${L.l}-flyout-${vp.name}.png`) });
        await page.keyboard.press('Escape');
        st = await page.evaluate(() => ({ e: document.getElementById('page-menu-btn').getAttribute('aria-expanded'), f: document.activeElement.id }));
        log(st.e === 'false' && st.f === 'page-menu-btn', `${L.l}@${vp.name} Escape closes + focus to button`);
        await page.click('#page-menu-btn'); await page.mouse.click(vp.width / 2, 600);
        log(await page.$eval('#page-menu-btn', b => b.getAttribute('aria-expanded')) === 'false', `${L.l}@${vp.name} outside click closes`);
        await page.click('#page-menu-btn'); await page.click('#solutions-menu-btn');
        st = await page.evaluate(() => ({ p: document.getElementById('page-menu').classList.contains('is-open'), s: document.getElementById('solutions-menu').classList.contains('is-open') }));
        log(!st.p && st.s, `${L.l}@${vp.name} opening solutions closes page flyout`);
        await page.click('#page-menu-btn');
        st = await page.evaluate(() => ({ p: document.getElementById('page-menu').classList.contains('is-open'), s: document.getElementById('solutions-menu').classList.contains('is-open') }));
        log(st.p && !st.s, `${L.l}@${vp.name} opening page flyout closes solutions`);
        await page.keyboard.press('Escape');
        const ids = await page.$$eval('#page-menu a', as => as.map(a => a.dataset.sectionLink));
        for (const id of ids) {
          await page.click('#page-menu-btn');
          await page.click(`#page-menu a[data-section-link="${id}"]`); await wait(450);
          const g = await page.evaluate((id) => {
            const hdr = document.querySelector('.site-header').getBoundingClientRect().bottom, sec = document.getElementById(id);
            const h = sec.querySelector('h1,h2') || sec;
            const cur = document.querySelector('#page-menu a[aria-current="location"]');
            return { hdr, top: sec.getBoundingClientRect().top, ht: h.getBoundingClientRect().top, open: document.getElementById('page-menu').classList.contains('is-open'), cur: cur ? cur.dataset.sectionLink : null, hash: location.hash };
          }, id);
          log(!g.open && g.hash === '#' + id && g.top >= g.hdr - 1 && g.ht >= g.hdr, `${L.l}@${vp.name} jump #${id}: section ${Math.round(g.top)} heading ${Math.round(g.ht)} >= header ${Math.round(g.hdr)}; marker=${g.cur}`);
        }
        await page.screenshot({ path: path.join(OUT, `${L.l}-landing-contact-${vp.name}.png`) });
      } else {
        await page.evaluate(() => scrollTo(0, 0)); await wait(100);
        await page.click('#drawer-toggle-btn'); await wait(300);
        let st = await page.evaluate(() => { const d = document.getElementById('mobile-drawer'), r = d.getBoundingClientRect(); return { e: document.getElementById('drawer-toggle-btn').getAttribute('aria-expanded'), w: r.width / innerWidth, px: r.width, f: d.contains(document.activeElement), first: d.querySelector('.drawer-nav .drawer-group-title').textContent.trim() }; });
        log(st.e === 'true' && st.f && (st.w > 0.85 || Math.abs(st.px - 440) < 1) && st.w <= 1, `${L.l}@${vp.name} drawer open, width ${(st.w * 100).toFixed(0)}%, focus inside, first group "${st.first}"`);
        await page.screenshot({ path: path.join(OUT, `${L.l}-drawer-${vp.name}.png`) });
        st = await page.evaluate(() => { const d = document.getElementById('mobile-drawer'); d.scrollTop = d.scrollHeight; const c = document.querySelector('.drawer-footer a').getBoundingClientRect(); const hw = Array.from(d.querySelectorAll('.drawer-links-direct a')).map(a => a.getAttribute('href')); return { ctaVis: c.bottom <= innerHeight + 1 && c.top >= 0, hw }; });
        await wait(150); await page.screenshot({ path: path.join(OUT, `${L.l}-drawer-bottom-${vp.name}.png`) });
        log(st.ctaVis && st.hw.some(h => /how-we-work\/$/.test(h)), `${L.l}@${vp.name} drawer scrolls; contact + full how-we-work reachable`);
        await page.keyboard.press('Escape');
        log(await page.$eval('#drawer-toggle-btn', b => b.getAttribute('aria-expanded')) === 'false', `${L.l}@${vp.name} drawer Escape closes`);
        for (const id of ['founder', 'process', 'contact-cta']) {
          await page.click('#drawer-toggle-btn'); await wait(300);
          await page.evaluate((id) => document.querySelector(`.drawer-section-links a[data-section-link="${id}"]`).scrollIntoView({ block: 'center' }), id);
          await page.click(`.drawer-section-links a[data-section-link="${id}"]`); await wait(500);
          const g = await page.evaluate((id) => { const hdr = document.querySelector('.site-header').getBoundingClientRect().bottom, sec = document.getElementById(id), h = sec.querySelector('h2') || sec; return { hdr, ht: h.getBoundingClientRect().top, top: sec.getBoundingClientRect().top, open: document.getElementById('mobile-drawer').classList.contains('is-open'), lock: document.body.classList.contains('drawer-open') }; }, id);
          log(!g.open && !g.lock && g.top >= g.hdr - 1 && g.ht >= g.hdr, `${L.l}@${vp.name} drawer jump #${id}: heading ${Math.round(g.ht)} >= header ${Math.round(g.hdr)}`);
        }
      }
    }
  }
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAIL(S)` : '\nALL PASS');
})().catch(e => { console.error(e); process.exit(1); });
