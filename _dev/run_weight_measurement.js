const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(process.env.TEMP, 'node_modules', 'puppeteer-core'));

const stubDir = path.join(process.env.TEMP, 'wp6_asset_fix_build', 'stub');
const repoDir = path.resolve(__dirname, '..');
const PORT = 4031;
const BASE = `http://127.0.0.1:${PORT}`;
const FONT_REGEX = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  let filePath;
  if (u.startsWith('/_dev/')) {
    filePath = path.join(repoDir, u);
  } else {
    if (u.endsWith('/')) u += 'index.html';
    else if (!path.extname(u)) u += '/index.html';
    filePath = path.join(stubDir, u);
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found: ' + filePath);
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(data);
  });
});

async function measurePage(browser, pageUrl, isMobile = false) {
  const page = await browser.newPage();
  const blocked = [];
  const allowedExternal = [];

  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = req.url();
    if (u.startsWith(BASE) || u.startsWith('data:')) {
      return req.continue();
    }
    if (FONT_REGEX.test(u)) {
      allowedExternal.push(u);
      return req.continue();
    }
    blocked.push(u);
    req.abort();
  });

  const cdp = await page.target().createCDPSession();
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });

  const meta = {};
  const sizes = {};

  cdp.on('Network.responseReceived', e => {
    meta[e.requestId] = {
      url: e.response.url,
      type: e.type,
      mime: e.response.mimeType,
      status: e.response.status
    };
  });

  cdp.on('Network.loadingFinished', e => {
    sizes[e.requestId] = e.encodedDataLength;
  });

  if (isMobile) {
    const ver = await browser.version();
    const major = (ver.match(/\/(\d+)\./) || [])[1] || '140';
    await page.setUserAgent(`Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Mobile Safari/537.36`);
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  } else {
    await page.setViewport({ width: 1280, height: 800, isMobile: false, deviceScaleFactor: 1 });
  }

  const ua = await page.evaluate(() => navigator.userAgent);

  await page.goto(pageUrl, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  // Check if favicon was loaded. If not explicitly in sizes, trigger its link element fetch to ensure tab icon transfer is accounted for
  let faviconLoaded = Object.values(meta).some(m => m.url && m.url.includes('favicon.png'));
  if (!faviconLoaded) {
    console.log(`Favicon not automatically requested by headless Chrome on ${pageUrl}, fetching icon link explicitly...`);
    await page.evaluate(async () => {
      const link = document.querySelector('link[rel="icon"]');
      if (link && link.href) {
        await fetch(link.href, { cache: 'no-store' });
      }
    });
    await new Promise(r => setTimeout(r, 400));
  }

  let totalBytes = 0;
  const items = [];
  const byType = {};

  for (const id in sizes) {
    const m = meta[id] || { type: 'Other', mime: 'unknown', url: 'unknown' };
    const bytes = sizes[id];
    totalBytes += bytes;
    byType[m.type] = (byType[m.type] || 0) + bytes;
    items.push({
      type: m.type,
      mime: m.mime,
      url: m.url,
      bytes: bytes
    });
  }

  // Sort items descending by bytes
  items.sort((a, b) => b.bytes - a.bytes);

  await page.close();

  return {
    url: pageUrl,
    isMobile,
    ua,
    totalBytes,
    totalKB: +(totalBytes / 1024).toFixed(2),
    byType,
    items,
    blocked,
    allowedExternal
  };
}

server.listen(PORT, '127.0.0.1', async () => {
  console.log(`Server listening on 127.0.0.1:${PORT}`);
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: 'new',
      args: ['--no-first-run', '--no-default-browser-check']
    });

    console.log('Measuring cold first visit of / (Hebrew home) with desktop Chromium UA...');
    const homeDesktop = await measurePage(browser, `${BASE}/`, false);

    console.log('Measuring cold first visit of /en/ (English home) with desktop Chromium UA...');
    const enDesktop = await measurePage(browser, `${BASE}/en/`, false);

    console.log('Measuring cold first visit of / (Hebrew home) with mobile Chrome UA (for comparison)...');
    const homeMobile = await measurePage(browser, `${BASE}/`, true);

    const result = {
      timestamp: new Date().toISOString(),
      serverPort: PORT,
      budgetTargetBytes: 614400,
      budgetTargetKB: 600,
      homeDesktop,
      enDesktop,
      homeMobile
    };

    console.log('\n=== RESULTS SUMMARY ===');
    console.log(`/ (Hebrew Home, Desktop): ${homeDesktop.totalBytes} B (${homeDesktop.totalKB} KB) - Target: <= 614,400 B (PASS: ${homeDesktop.totalBytes <= 614400})`);
    console.log(`/en/ (English Home, Desktop): ${enDesktop.totalBytes} B (${enDesktop.totalKB} KB) - Target: <= 614,400 B (PASS: ${enDesktop.totalBytes <= 614400})`);
    console.log(`/ (Hebrew Home, Mobile): ${homeMobile.totalBytes} B (${homeMobile.totalKB} KB)`);

    console.log('\n--- Desktop / Resource Breakdown ---');
    homeDesktop.items.forEach(it => {
      console.log(`  ${it.type.padEnd(10)} | ${it.bytes.toString().padStart(8)} B | ${it.url}`);
    });

    fs.writeFileSync(
      path.join(repoDir, '_dev', 'wp6_weight_results.json'),
      JSON.stringify(result, null, 2)
    );
    console.log('\nSaved weight results to _dev/wp6_weight_results.json');
  } catch (err) {
    console.error('Measurement error:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close(() => {
      console.log('Server stopped.');
    });
  }
});
