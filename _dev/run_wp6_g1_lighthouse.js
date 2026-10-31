// _dev/run_wp6_g1_lighthouse.js
// WP6 G1 — isolated Lighthouse 12.8.2 runner on 127.0.0.1:4061

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const TEMP_DIR = 'C:\\Users\\msgad\\AppData\\Local\\Temp\\poworg-wp6-g1-20261031';
const SITE_DIR = path.join(TEMP_DIR, '_site_stub');
const LIGHTHOUSE_CLI = path.join(TEMP_DIR, 'node_modules', 'lighthouse', 'cli', 'index.js');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REPO_ROOT = path.resolve(__dirname, '..');
const G1_DIR = process.env.OUT_DIR ? path.resolve(REPO_ROOT, process.env.OUT_DIR) : path.join(REPO_ROOT, '_dev', 'g1_fix');

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

function runCommandAsync(bin, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, {
      cwd: REPO_ROOT,
      env: env,
      stdio: 'inherit'
    });
    child.on('error', reject);
    child.on('close', (code) => {
      resolve(code);
    });
  });
}

const PAGES = [
  { name: 'home', path: '/', outPrefix: 'lh_home' },
  { name: 'scenario', path: '/scenarios/recording-to-outputs/', outPrefix: 'lh_scenario' },
  { name: 'contact', path: '/contact/', outPrefix: 'lh_contact' }
];

async function run() {
  if (!fs.existsSync(G1_DIR)) {
    fs.mkdirSync(G1_DIR, { recursive: true });
  }

  const { server, port } = await startServer();

  try {
    for (const page of PAGES) {
      const url = `http://127.0.0.1:${port}${page.path}`;
      const outPath = path.join(G1_DIR, page.outPrefix);
      console.log('\n========================================');
      console.log(`Running Lighthouse on: ${url}`);
      console.log(`Output prefix: ${outPath}`);
      console.log('========================================');

      const args = [
        LIGHTHOUSE_CLI,
        url,
        `--chrome-path=${CHROME_PATH}`,
        '--chrome-flags=--headless=new',
        '--form-factor=mobile',
        '--throttling-method=simulate',
        '--only-categories=performance,accessibility,best-practices,seo',
        '--output=json',
        '--output=html',
        `--output-path=${outPath}`,
        '--blocked-url-patterns=*script.google.com*',
        '--blocked-url-patterns=*static.cloudflareinsights.com*',
        '--blocked-url-patterns=*cloudflareinsights.com*',
        '--blocked-url-patterns=*linkedin.com*',
        '--blocked-url-patterns=*poworg.com*'
      ];

      const env = {
        ...process.env,
        CHROME_PATH: CHROME_PATH
      };

      const exitCode = await runCommandAsync(process.execPath, args, env);
      console.log(`Lighthouse for ${page.name} exited with status ${exitCode}`);
    }
  } finally {
    server.close(() => {
      console.log('Static server stopped.');
    });
  }
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
