// _dev/run_appearance_gate.js
// Appearance gate comparing base HEAD (4061) vs working fix (4062)

const http = require('http');
const fs = require('fs');
const path = require('path');

const TEMP_DIR = 'C:\\Users\\msgad\\AppData\\Local\\Temp\\poworg-wp6-g1-20261031';
const BASE_SITE_DIR = path.join(TEMP_DIR, '_site_base');
const FIX_SITE_DIR = path.join(TEMP_DIR, '_site_fix');
const PUPPETEER_PATH = path.join(TEMP_DIR, 'node_modules', 'puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.woff2': 'font/woff2'
};

function createStaticServer(siteDir, port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(siteDir, urlPath);
      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }
      } catch (e) {}

      fs.readFile(filePath, (err, data) => {
        if (err) {
          const notFoundPath = path.join(siteDir, '404.html');
          if (fs.existsSync(notFoundPath)) {
            res.writeHead(404, { 'Content-Type': MIME_TYPES['.html'] });
            res.end(fs.readFileSync(notFoundPath));
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
          }
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Cache-Control': 'no-store'
        });
        res.end(data);
      });
    });

    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812, isMobile: true, dpr: 2 },
  { name: 'desktop', width: 1280, height: 800, isMobile: false, dpr: 1 }
];

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'en_home', path: '/en/' },
  { name: 'contact', path: '/contact/' },
  { name: 'en_contact', path: '/en/contact/' }
];

async function extractStylesAndBBoxes(page, pagePath) {
  return await page.evaluate((currPath) => {
    const targets = [];

    // 1. .lang-switch
    const langSwitches = Array.from(document.querySelectorAll('.lang-switch'));
    langSwitches.forEach((el, idx) => {
      targets.push({ id: `lang-switch-${idx}`, el });
    });

    // 2. step headings (on / and /en/)
    const stepHeadings = Array.from(document.querySelectorAll('.work-step-col h3, .work-step-col h4'));
    stepHeadings.forEach((el, idx) => {
      targets.push({ id: `step-heading-${idx}`, el });
    });

    // 3. footer column headings
    const footerHeadings = Array.from(document.querySelectorAll('.footer-col h2, .footer-col h4'));
    footerHeadings.forEach((el, idx) => {
      targets.push({ id: `footer-heading-${idx}`, el });
    });

    // 4. contact headings
    const contactHeadings = Array.from(document.querySelectorAll('.contact-col-info h2, .contact-col-info h3, .contact-col-info h4'));
    contactHeadings.forEach((el, idx) => {
      targets.push({ id: `contact-heading-${idx}`, el });
    });

    const results = {};
    for (const item of targets) {
      const rect = item.el.getBoundingClientRect();
      const cs = window.getComputedStyle(item.el);
      results[item.id] = {
        text: item.el.textContent.trim(),
        tagName: item.el.tagName,
        bbox: {
          x: Math.round(rect.x * 100) / 100,
          y: Math.round(rect.y * 100) / 100,
          width: Math.round(rect.width * 100) / 100,
          height: Math.round(rect.height * 100) / 100
        },
        styles: {
          'font-size': cs.fontSize,
          'font-weight': cs.fontWeight,
          'line-height': cs.lineHeight,
          'letter-spacing': cs.letterSpacing,
          'color': cs.color,
          'margin-top': cs.marginTop,
          'margin-right': cs.marginRight,
          'margin-bottom': cs.marginBottom,
          'margin-left': cs.marginLeft,
          'display': cs.display
        }
      };
    }
    return results;
  }, pagePath);
}

async function run() {
  console.log('Starting static servers...');
  const baseServer = await createStaticServer(BASE_SITE_DIR, 4061);
  const fixServer = await createStaticServer(FIX_SITE_DIR, 4062);
  console.log('Base server on 127.0.0.1:4061, Fix server on 127.0.0.1:4062');

  const puppeteer = require(PUPPETEER_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const diffReport = {
    gatePassed: true,
    comparisons: []
  };

  try {
    for (const pageDef of PAGES) {
      for (const vp of VIEWPORTS) {
        console.log(`\nComparing ${pageDef.name} (${pageDef.path}) at ${vp.name} (${vp.width}x${vp.height})...`);

        // Load Base
        const pageBase = await browser.newPage();
        await pageBase.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, isMobile: vp.isMobile });
        await pageBase.goto(`http://127.0.0.1:4061${pageDef.path}`, { waitUntil: 'networkidle0', timeout: 30000 });
        await pageBase.evaluate(async () => {
          await document.fonts.load('400 16px Heebo');
          await document.fonts.load('700 16px Heebo');
          await document.fonts.load('400 16px Inter');
          await document.fonts.load('700 16px Inter');
          await document.fonts.ready;
        });

        const baseStyles = await extractStylesAndBBoxes(pageBase, pageDef.path);
        const baseShotBuffer = await pageBase.screenshot({ fullPage: true });

        // Load Fix
        const pageFix = await browser.newPage();
        await pageFix.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, isMobile: vp.isMobile });
        await pageFix.goto(`http://127.0.0.1:4062${pageDef.path}`, { waitUntil: 'networkidle0', timeout: 30000 });
        await pageFix.evaluate(async () => {
          await document.fonts.load('400 16px Heebo');
          await document.fonts.load('700 16px Heebo');
          await document.fonts.load('400 16px Inter');
          await document.fonts.load('700 16px Inter');
          await document.fonts.ready;
        });

        const fixStyles = await extractStylesAndBBoxes(pageFix, pageDef.path);
        const fixShotBuffer = await pageFix.screenshot({ fullPage: true });

        await pageBase.close();
        await pageFix.close();

        // Compare styles and bboxes
        const styleMismatches = [];
        const baseKeys = Object.keys(baseStyles);
        const fixKeys = Object.keys(fixStyles);

        if (baseKeys.length !== fixKeys.length) {
          styleMismatches.push({
            error: `Target count mismatch: base has ${baseKeys.length}, fix has ${fixKeys.length}`
          });
        }

        for (const k of baseKeys) {
          if (!fixStyles[k]) {
            styleMismatches.push({ target: k, error: 'Missing in fix' });
            continue;
          }
          const b = baseStyles[k];
          const f = fixStyles[k];

          // Check bbox
          const bboxDiff = {};
          for (const dim of ['x', 'y', 'width', 'height']) {
            if (b.bbox[dim] !== f.bbox[dim]) {
              bboxDiff[dim] = { base: b.bbox[dim], fix: f.bbox[dim] };
            }
          }

          // Check styles
          const propDiff = {};
          for (const prop of Object.keys(b.styles)) {
            if (b.styles[prop] !== f.styles[prop]) {
              propDiff[prop] = { base: b.styles[prop], fix: f.styles[prop] };
            }
          }

          if (Object.keys(bboxDiff).length > 0 || Object.keys(propDiff).length > 0) {
            styleMismatches.push({
              target: k,
              text: b.text,
              bboxDiff,
              propDiff
            });
          }
        }

        // Compare buffer exact equality first
        const bufferExactEqual = baseShotBuffer.equals(fixShotBuffer);

        diffReport.comparisons.push({
          page: pageDef.name,
          path: pageDef.path,
          viewport: vp.name,
          dimensions: `${vp.width}x${vp.height}`,
          targetCount: baseKeys.length,
          styleMismatchesCount: styleMismatches.length,
          styleMismatches,
          bufferExactEqual,
          pass: styleMismatches.length === 0 && bufferExactEqual
        });

        if (styleMismatches.length > 0 || !bufferExactEqual) {
          diffReport.gatePassed = false;
        }

        console.log(` - Target count: ${baseKeys.length}`);
        console.log(` - Style mismatches: ${styleMismatches.length}`);
        console.log(` - Full-page screenshot buffer equal: ${bufferExactEqual}`);
      }
    }
  } finally {
    await browser.close();
    baseServer.close();
    fixServer.close();
  }

  console.log('\n================ APPEARANCE GATE SUMMARY ================');
  console.log(`Gate passed: ${diffReport.gatePassed ? 'YES (ALL PASS)' : 'NO (FAILED)'}`);
  console.table(diffReport.comparisons.map(c => ({
    Page: c.page,
    Viewport: c.viewport,
    Targets: c.targetCount,
    'Style Mismatches': c.styleMismatchesCount,
    'Buffer Exact Equal': c.bufferExactEqual,
    Status: c.pass ? 'PASS' : 'FAIL'
  })));

  fs.writeFileSync(path.join(__dirname, 'appearance_gate_results.json'), JSON.stringify(diffReport, null, 2), 'utf8');
  return diffReport;
}

run().catch((err) => {
  console.error('Fatal error in appearance gate:', err);
  process.exit(1);
});
