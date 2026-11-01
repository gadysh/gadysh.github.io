/**
 * Local Lead Endpoint Stub Server for PowOrg WP4 Testing
 * Spec: claude_website_spec_v2.md (§6.6, §7.2 WP4)
 * Dependency-free Node.js HTTP server.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4005;
const REQUESTS_FILE = path.join(__dirname, 'stub_requests.json');

let requestsLog = [];
let currentMode = '200'; // Default mode: 200, 500, timeout, disconnect

function saveRequests() {
  try {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requestsLog, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write stub requests file:', e);
  }
}

function handleRequest(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Stub-Mode');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const pathname = parsedUrl.pathname;
  const modeParam = parsedUrl.searchParams.get('mode') || req.headers['x-stub-mode'];

  // Control endpoints for tests
  if (pathname === '/stub/set-mode') {
    if (modeParam) currentMode = modeParam;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', mode: currentMode }));
    return;
  }

  if (pathname === '/stub/requests') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(requestsLog));
    return;
  }

  if (pathname === '/stub/clear') {
    requestsLog = [];
    currentMode = '200';
    saveRequests();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'cleared' }));
    return;
  }

  // Lead submission endpoint: /api/lead (or subpaths)
  if (pathname.startsWith('/api/lead') || pathname === '/api/leads') {
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
    });

    req.on('end', () => {
      let jsonBody = null;
      try {
        jsonBody = JSON.parse(bodyData);
      } catch (e) {
        jsonBody = { raw: bodyData };
      }

      // Determine active mode for this request
      let activeMode = modeParam || currentMode;
      if (pathname.includes('/500')) activeMode = '500';
      if (pathname.includes('/timeout')) activeMode = 'timeout';
      if (pathname.includes('/disconnect')) activeMode = 'disconnect';
      if (pathname.includes('/rejected')) activeMode = 'rejected';

      const entry = {
        id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        mode: activeMode,
        headers: req.headers,
        body: jsonBody,
        honeypot_detected: !!(jsonBody && jsonBody.hp)
      };

      requestsLog.push(entry);
      saveRequests();

      // Execute mode response
      if (activeMode === 'disconnect') {
        // Destroy socket to simulate abrupt connection failure / network error
        if (req.socket) req.socket.destroy();
        return;
      }

      if (activeMode === 'timeout') {
        // Delay by 16 seconds (client timeout is 15 seconds)
        setTimeout(() => {
          if (!res.writableEnded) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok_delayed' }));
          }
        }, 16000);
        return;
      }

      if (activeMode === 'rejected') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'rejected' }));
        return;
      }

      if (activeMode === '500') {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: 'Internal Server Error (Simulated 500)' }));
        return;
      }

      // Normal 200 OK
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        id: entry.id,
        honeypot_ignored: entry.honeypot_detected
      }));
    });
    return;
  }

  // 404 for unknown endpoints
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

function startStubServer(port = PORT) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(handleRequest);
    server.listen(port, '127.0.0.1', () => {
      console.log(`Lead stub server listening on http://127.0.0.1:${port}`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

if (require.main === module) {
  startStubServer(PORT).catch(err => {
    console.error('Failed to start stub server:', err);
    process.exit(1);
  });
}

module.exports = {
  startStubServer,
  PORT,
  getRequestsLog: () => requestsLog,
  clearRequestsLog: () => { requestsLog = []; saveRequests(); },
  setMode: (m) => { currentMode = m; }
};
