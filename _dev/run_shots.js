const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(process.env.TEMP, 'node_modules', 'puppeteer-core'));

const stage = process.argv[2] || 'before';
const stubDir = path.join(process.env.TEMP, 'wp6_asset_fix_build', 'stub');
const repoDir = path.resolve(__dirname, '..');
const shotsDir = path.join(__dirname, 'shots', 'asset_fix');
const PORT = 4031;

if (!fs.existsSync(shotsDir)) {
  fs.mkdirSync(shotsDir, { recursive: true });
}

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

server.listen(PORT, '127.0.0.1', async () => {
  console.log(`Server listening on 127.0.0.1:${PORT} for stage: ${stage}`);
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: 'new',
      args: ['--no-first-run', '--no-default-browser-check']
    });

    // 1. DPR 1 captures
    console.log(`Capturing DPR 1 (${stage})...`);
    const page1 = await browser.newPage();
    await page1.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    await page1.goto(`http://127.0.0.1:${PORT}/_dev/shots_harness.html`, { waitUntil: 'networkidle0' });

    const h38_1 = await page1.$('#render-header-38 img');
    await h38_1.screenshot({ path: path.join(shotsDir, `header_38px_dpr1_${stage}.png`) });

    const d32_1 = await page1.$('#render-drawer-32 img');
    await d32_1.screenshot({ path: path.join(shotsDir, `drawer_32px_dpr1_${stage}.png`) });

    const fav16_1 = await page1.$('#render-favicon-16 img');
    await fav16_1.screenshot({ path: path.join(shotsDir, `favicon_16px_${stage}.png`) });

    const fav32_1 = await page1.$('#render-favicon-32 img');
    await fav32_1.screenshot({ path: path.join(shotsDir, `favicon_32px_${stage}.png`) });

    // Live header at DPR 1
    await page1.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle0' });
    const liveH1 = await page1.$('.site-header .brand img');
    await liveH1.screenshot({ path: path.join(shotsDir, `live_header_38px_dpr1_${stage}.png`) });
    await page1.close();

    // 2. DPR 2 captures
    console.log(`Capturing DPR 2 (${stage})...`);
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
    await page2.goto(`http://127.0.0.1:${PORT}/_dev/shots_harness.html`, { waitUntil: 'networkidle0' });

    const h38_2 = await page2.$('#render-header-38 img');
    await h38_2.screenshot({ path: path.join(shotsDir, `header_38px_dpr2_${stage}.png`) });

    const d32_2 = await page2.$('#render-drawer-32 img');
    await d32_2.screenshot({ path: path.join(shotsDir, `drawer_32px_dpr2_${stage}.png`) });

    const fav16_2 = await page2.$('#render-favicon-16 img');
    await fav16_2.screenshot({ path: path.join(shotsDir, `favicon_16px_dpr2_${stage}.png`) });

    const fav32_2 = await page2.$('#render-favicon-32 img');
    await fav32_2.screenshot({ path: path.join(shotsDir, `favicon_32px_dpr2_${stage}.png`) });

    // Live header at DPR 2
    await page2.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle0' });
    const liveH2 = await page2.$('.site-header .brand img');
    await liveH2.screenshot({ path: path.join(shotsDir, `live_header_38px_dpr2_${stage}.png`) });

    // Live drawer at DPR 2 (mobile view)
    await page2.setViewport({ width: 375, height: 812, isMobile: true, deviceScaleFactor: 2 });
    await page2.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle0' });
    await page2.click('#drawer-toggle-btn');
    await new Promise(r => setTimeout(r, 400));
    const liveD2 = await page2.$('.mobile-drawer .brand img');
    await liveD2.screenshot({ path: path.join(shotsDir, `live_drawer_32px_dpr2_${stage}.png`) });

    await page2.close();
    console.log(`All ${stage} screenshots captured successfully.`);
  } catch (err) {
    console.error('Error during capture:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close(() => {
      console.log('Server stopped.');
    });
  }
});
