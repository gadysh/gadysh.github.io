// _dev/run_hero_poworg_ai_qa.js
// Homepage hero (PowOrg AI cube artwork, 2026-11-01): rendered screenshots + layout/a11y checks.
// Usage: node _dev/run_hero_poworg_ai_qa.js <built_site_dir>
// Serves the built site on 127.0.0.1:4072, shots go to _dev/shots/hero_poworg_ai/.

const http = require('http');
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.resolve(process.argv[2] || path.join(process.env.TEMP, 'hero_build'));
const PUPPETEER = require(path.join(process.env.TEMP, 'node_modules', 'puppeteer-core'));
const AXE_PATH = path.join(process.env.TEMP, 'poworg-wp6-g1-20261031', 'node_modules', 'axe-core', 'axe.min.js');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, 'shots', 'hero_poworg_ai');
const PORT = 4072;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json'
};

// Scene regions in source-image pixels (1536x1024) that copy must never cover
const PROTECTED = {
  'docs-in': [40, 530, 260, 720],
  'ai-cube': [345, 458, 645, 728],
  'systems': [600, 525, 1010, 775],
  'human': [1030, 600, 1230, 830],
  'output': [1280, 615, 1495, 845]
};
// Crop offsets/sizes per derivative (see hero-art.html)
const CROPS = {
  '1536': [0, 0, 1536, 1024],
  'scene': [0, 380, 1536, 520],
  'mobile': [24, 410, 1488, 550]
};

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'laptop-1280', width: 1280, height: 800 },
  { name: 'small-1024', width: 1024, height: 768 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844, mobile: true },
  { name: 'mobile-360', width: 360, height: 780, mobile: true }
];
const PAGES = [{ name: 'he', url: '/' }, { name: 'en', url: '/en/' }];

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
      let f = path.join(SITE_DIR, p);
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      fs.readFile(f, (err, data) => {
        if (err) { res.writeHead(404); return res.end('Not found'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

function intersects(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

async function measure(page) {
  return page.evaluate((PROTECTED, CROPS) => {
    const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top + scrollY, w: b.width, h: b.height }; };
    const img = document.querySelector('.hero-art-media img');
    const src = img.currentSrc || img.src;
    const key = /-mobile\./.test(src) ? 'mobile' : /-scene\./.test(src) ? 'scene' : '1536';
    const [cx, cy, cw, ch] = CROPS[key];
    const ib = r(img);
    // Visible part of the image is clipped by the hero (overflow hidden)
    const hero = r(document.querySelector('.hero-art'));
    const sx = ib.w / cw, sy = ib.h / ch;
    const zones = {};
    for (const [k, [x0, y0, x1, y1]] of Object.entries(PROTECTED)) {
      const z = { x: ib.x + (x0 - cx) * sx, y: ib.y + (y0 - cy) * sy, w: (x1 - x0) * sx, h: (y1 - y0) * sy };
      const visX0 = Math.max(z.x, 0), visX1 = Math.min(z.x + z.w, document.documentElement.clientWidth);
      const visY0 = Math.max(z.y, hero.y), visY1 = Math.min(z.y + z.h, hero.y + hero.h);
      z.visibleFraction = Math.max(0, visX1 - visX0) * Math.max(0, visY1 - visY0) / (z.w * z.h);
      zones[k] = z;
    }
    const text = {};
    const h1 = document.querySelector('.hero-art h1');
    const lead = document.querySelector('.hero-art .text-lead');
    // Measure text line boxes, not the block box
    const lineBoxes = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); return [...rg.getClientRects()].map(b => ({ x: b.left, y: b.top + scrollY, w: b.width, h: b.height })); };
    text.h1 = lineBoxes(h1);
    text.lead = lineBoxes(lead);
    text.buttons = [...document.querySelectorAll('.hero-art .hero-actions .btn')].map(r);
    const cs = getComputedStyle(h1);
    const primary = document.querySelector('.hero-art .btn-primary');
    return {
      currentSrc: src.replace(location.origin, ''), crop: key, naturalWidth: img.naturalWidth, complete: img.complete,
      hero, image: ib, zones, text,
      h1Font: cs.fontSize, h1Lines: Math.round(h1.getBoundingClientRect().height / parseFloat(cs.lineHeight)),
      primaryBtn: r(primary), primaryHref: primary.getAttribute('href'), primaryTrack: primary.getAttribute('data-track-location'),
      secondaryHref: document.querySelector('.hero-art .btn-secondary').getAttribute('href'),
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      dir: document.documentElement.dir, lang: document.documentElement.lang,
      headerClass: document.querySelector('.site-header').className,
      headerHeight: document.querySelector('.site-header').getBoundingClientRect().height
    };
  }, PROTECTED, CROPS);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const server = await serve();
  const browser = await PUPPETEER.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--font-render-hinting=none'] });
  const results = { siteDir: SITE_DIR, runs: [], interactions: {}, axe: {}, failures: [] };
  const fail = (msg) => { results.failures.push(msg); console.log('FAIL ' + msg); };

  for (const pg of PAGES) {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.mobile ? 2 : 1, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
      await page.goto(`http://127.0.0.1:${PORT}${pg.url}`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      const m = await measure(page);
      const id = `${pg.name}-${vp.name}`;
      const fold = path.join(OUT_DIR, `${id}-fold.png`);
      await page.screenshot({ path: fold });
      const heroShot = path.join(OUT_DIR, `${id}-hero.png`);
      const heroEl = await page.$('.hero-art');
      await heroEl.screenshot({ path: heroShot });

      // Checks
      if (m.overflowX > 0) fail(`${id}: horizontal overflow ${m.overflowX}px`);
      if (!m.complete || !m.naturalWidth) fail(`${id}: hero image not loaded`);
      const textBoxes = [...m.text.h1, ...m.text.lead, ...m.text.buttons];
      for (const [k, z] of Object.entries(m.zones)) {
        if (z.visibleFraction < 0.05) continue; // cropped out at this breakpoint
        for (const t of textBoxes) if (intersects(t, z)) { fail(`${id}: copy overlaps scene zone ${k}`); break; }
      }
      if (m.zones['ai-cube'].visibleFraction < 0.98) fail(`${id}: AI cube not fully visible (${m.zones['ai-cube'].visibleFraction.toFixed(2)})`);
      const btnBottom = m.primaryBtn.y + m.primaryBtn.h;
      const ctaInFold = btnBottom <= vp.height;
      if (!ctaInFold) fail(`${id}: primary CTA below the first screen (${Math.round(btnBottom)} > ${vp.height})`);
      const cubeBottom = m.zones['ai-cube'].y + m.zones['ai-cube'].h;
      results.runs.push({
        id, page: pg.url, viewport: `${vp.width}x${vp.height}`, crop: m.crop, currentSrc: m.currentSrc,
        overflowX: m.overflowX, h1Font: m.h1Font, h1Lines: m.h1Lines, dir: m.dir, headerClass: m.headerClass,
        heroHeight: Math.round(m.hero.h), ctaBottom: Math.round(btnBottom), ctaInFirstScreen: ctaInFold,
        cubeWidthPx: Math.round(m.zones['ai-cube'].w), cubeBottom: Math.round(cubeBottom), cubeInFirstScreen: cubeBottom <= vp.height,
        visible: Object.fromEntries(Object.entries(m.zones).map(([k, z]) => [k, +z.visibleFraction.toFixed(2)])),
        primaryHref: m.primaryHref, primaryTrack: m.primaryTrack, secondaryHref: m.secondaryHref,
        shots: [fold, heroShot]
      });
      await page.close();
    }
  }

  // Reduced motion + full page (desktop & mobile) to confirm later sections unchanged in place
  for (const [name, vp] of [['he-desktop-1440', { width: 1440, height: 900 }], ['he-mobile-390', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }], ['en-desktop-1440', { width: 1440, height: 900 }]]) {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setViewport(vp);
    await page.goto(`http://127.0.0.1:${PORT}${name.startsWith('en') ? '/en/' : '/'}`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(OUT_DIR, `${name}-fullpage-reduced-motion.png`), fullPage: true });
    await page.close();
  }

  // Interactions: solutions menu (desktop), drawer (mobile), CTA navigation, tracking hook, focus ring
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    const logs = [];
    page.on('console', (msg) => logs.push(msg.text()));
    await page.goto(`http://127.0.0.1:${PORT}/?debug=track`, { waitUntil: 'networkidle0' });
    await page.click('#solutions-menu-btn');
    const menuOpen = await page.$eval('#solutions-menu', (el) => el.classList.contains('is-open') && getComputedStyle(el).display !== 'none');
    await page.screenshot({ path: path.join(OUT_DIR, 'he-desktop-1440-solutions-menu.png') });
    await page.keyboard.press('Escape');
    // Keyboard focus on hero primary CTA
    await page.focus('.hero-art .btn-primary');
    await page.keyboard.press('Shift');
    const focusOutline = await page.$eval('.hero-art .btn-primary', (el) => { el.focus(); const s = getComputedStyle(el); return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`; });
    await page.screenshot({ path: path.join(OUT_DIR, 'he-desktop-1440-cta-focus.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });
    await page.evaluate(() => document.querySelector('.hero-art .btn-primary').addEventListener('click', (e) => e.preventDefault(), { once: true }));
    await page.click('.hero-art .btn-primary');
    await page.click('.hero-art .btn-secondary');
    const afterSecondary = await page.evaluate(() => ({ hash: location.hash, domainsTop: Math.round(document.getElementById('domains').getBoundingClientRect().top) }));
    await Promise.all([page.waitForNavigation(), page.click('#desktop-cta')]);
    const ctaUrl = page.url();
    results.interactions.desktop = { menuOpen, focusOutline, afterSecondary, headerCtaNavigatesTo: ctaUrl, trackLogs: logs.filter((l) => l.startsWith('[track]')) };
    await page.close();

    const mp = await browser.newPage();
    await mp.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await mp.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle0' });
    await mp.click('#drawer-toggle-btn');
    await new Promise((r) => setTimeout(r, 300));
    const drawerOpen = await mp.$eval('#mobile-drawer', (el) => el.classList.contains('is-open'));
    await mp.screenshot({ path: path.join(OUT_DIR, 'he-mobile-390-drawer.png') });
    results.interactions.mobile = { drawerOpen };
    await mp.close();
  }

  // axe-core on both homepages (desktop + mobile)
  const axeSrc = fs.readFileSync(AXE_PATH, 'utf8');
  for (const pg of PAGES) {
    for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage();
      await page.setViewport(vp);
      await page.goto(`http://127.0.0.1:${PORT}${pg.url}`, { waitUntil: 'networkidle0' });
      await page.addScriptTag({ content: axeSrc });
      const res = await page.evaluate(async () => {
        const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
        return { violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 5) })), incomplete: r.incomplete.map((v) => v.id) };
      });
      results.axe[`${pg.name}-${vp.width}`] = res;
      if (res.violations.length) fail(`axe ${pg.name}-${vp.width}: ${res.violations.map((v) => v.id).join(', ')}`);
      await page.close();
    }
  }

  await browser.close();
  server.close();
  fs.writeFileSync(path.join(OUT_DIR, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results.runs.map((r) => ({ id: r.id, crop: r.crop, h1: `${r.h1Font}/${r.h1Lines}l`, hero: r.heroHeight, cta: r.ctaBottom, cubeW: r.cubeWidthPx, cubeBottom: r.cubeBottom, vis: r.visible })), null, 0).replace(/},{/g, '},\n{'));
  console.log('interactions', JSON.stringify(results.interactions));
  console.log('failures', results.failures.length);
})().catch((e) => { console.error(e); process.exit(1); });
