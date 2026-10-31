// _dev/run_wp6_g1_axe.js
// WP6 G1 — isolated axe-core 4.14.0 runner with puppeteer-core on 127.0.0.1:4061

const http = require('http');
const fs = require('fs');
const path = require('path');

const TEMP_DIR = 'C:\\Users\\msgad\\AppData\\Local\\Temp\\poworg-wp6-g1-20261031';
const SITE_DIR = path.join(TEMP_DIR, '_site_stub');
const AXE_PATH = path.join(TEMP_DIR, 'node_modules', 'axe-core', 'axe.min.js');
const PUPPETEER_PATH = path.join(TEMP_DIR, 'node_modules', 'puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REPO_ROOT = path.resolve(__dirname, '..');
const G1_DIR = path.join(REPO_ROOT, '_dev', 'g1');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.woff2': 'font/woff2'
};

function createStaticServer(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(SITE_DIR, urlPath);
      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }
      } catch (e) {}

      fs.readFile(filePath, (err, data) => {
        if (err) {
          const notFoundPath = path.join(SITE_DIR, '404.html');
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

    server.on('error', (err) => {
      reject(err);
    });

    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

async function startServer() {
  try {
    const server = await createStaticServer(4061);
    console.log('Static server listening on 127.0.0.1:4061');
    return { server, port: 4061 };
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      console.log('Port 4061 in use, falling back to 4062');
      const server = await createStaticServer(4062);
      console.log('Static server listening on 127.0.0.1:4062');
      return { server, port: 4062 };
    }
    throw err;
  }
}

const ALL_PAGES = [
  { name: 'home', path: '/', outFile: 'axe_home.json', required: true },
  { name: 'scenario', path: '/scenarios/recording-to-outputs/', outFile: 'axe_scenario.json', required: true },
  { name: 'contact', path: '/contact/', outFile: 'axe_contact.json', required: true },
  { name: 'en', path: '/en/', outFile: 'axe_en.json', required: false }
];

async function run() {
  if (!fs.existsSync(G1_DIR)) {
    fs.mkdirSync(G1_DIR, { recursive: true });
  }

  const targetArg = process.argv[2];
  let pagesToRun = ALL_PAGES;
  if (targetArg) {
    pagesToRun = ALL_PAGES.filter(p => p.name === targetArg || p.path === targetArg || targetArg.includes(p.name));
    if (pagesToRun.length === 0) {
      console.error(`Unknown page filter: ${targetArg}`);
      process.exit(1);
    }
  }

  const puppeteer = require(PUPPETEER_PATH);
  const axeSource = fs.readFileSync(AXE_PATH, 'utf8');

  const { server, port } = await startServer();

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const pageSummary = [];

    for (const pageDef of pagesToRun) {
      const url = `http://127.0.0.1:${port}${pageDef.path}`;
      console.log('\n========================================');
      console.log(`Running axe-core 4.14.0 on: ${url} (${pageDef.name})`);
      console.log('========================================');

      const page = await browser.newPage();
      await page.setViewport({
        width: 375,
        height: 812,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true
      });

      const requestedOrigins = new Set();
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        try {
          const u = new URL(req.url());
          requestedOrigins.add(u.origin);
          const host = u.hostname;
          if (host === '127.0.0.1' || host === 'localhost' || host === 'fonts.googleapis.com' || host === 'fonts.gstatic.com') {
            req.continue();
          } else {
            console.log(`[AXE NETWORK BLOCKED]: ${req.url()}`);
            req.abort();
          }
        } catch (e) {
          req.abort();
        }
      });

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      // Inject axe-core
      await page.evaluate(axeSource);

      // Run axe
      const axeResults = await page.evaluate(async () => {
        return await axe.run(document, {
          resultTypes: ['violations', 'incomplete']
        });
      });

      const outFilePath = path.join(G1_DIR, pageDef.outFile);
      fs.writeFileSync(outFilePath, JSON.stringify(axeResults, null, 2), 'utf8');
      console.log(`Saved axe results to: ${outFilePath}`);

      // Count impacts
      const impactCounts = { minor: 0, moderate: 0, serious: 0, critical: 0 };
      for (const v of axeResults.violations) {
        const imp = v.impact || 'minor';
        impactCounts[imp] = (impactCounts[imp] || 0) + 1;
      }
      const seriousCritical = impactCounts.serious + impactCounts.critical;

      const hasHeadingOrder = axeResults.violations.some(v => v.id === 'heading-order');

      console.log(`testEngine.version: ${axeResults.testEngine ? axeResults.testEngine.version : 'unknown'}`);
      console.log(`Violations total: ${axeResults.violations.length}`);
      console.log(`Impact counts: minor=${impactCounts.minor}, moderate=${impactCounts.moderate}, serious=${impactCounts.serious}, critical=${impactCounts.critical}`);
      console.log(`Serious + Critical count: ${seriousCritical}`);
      console.log(`F-WP6-1 (heading-order) flagged: ${hasHeadingOrder}`);
      console.log(`Requested origins:`, Array.from(requestedOrigins));

      for (const v of axeResults.violations) {
        console.log(` - [${v.impact.toUpperCase()}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
      }

      pageSummary.push({
        page: pageDef.name,
        path: pageDef.path,
        required: pageDef.required,
        engineVersion: axeResults.testEngine ? axeResults.testEngine.version : 'unknown',
        violationsCount: axeResults.violations.length,
        incompleteCount: axeResults.incomplete ? axeResults.incomplete.length : 0,
        impactCounts,
        seriousCritical,
        hasHeadingOrder,
        requestedOrigins: Array.from(requestedOrigins),
        pass: seriousCritical === 0
      });

      await page.close();
    }

    console.log('\n================ axe-core Summary ================');
    console.table(pageSummary.map(p => ({
      Page: p.page,
      Version: p.engineVersion,
      'Minor': p.impactCounts.minor,
      'Moderate': p.impactCounts.moderate,
      'Serious': p.impactCounts.serious,
      'Critical': p.impactCounts.critical,
      'Serious+Critical': p.seriousCritical,
      'Pass (<1)': p.pass ? 'PASS' : 'FAIL',
      'F-WP6-1': p.hasHeadingOrder ? 'FLAGGED' : 'NOT FLAGGED'
    })));

  } finally {
    if (browser) {
      await browser.close();
    }
    server.close(() => {
      console.log('Static server stopped.');
    });
  }
}

run().catch((err) => {
  console.error('Fatal error in axe runner:', err);
  process.exit(1);
});
