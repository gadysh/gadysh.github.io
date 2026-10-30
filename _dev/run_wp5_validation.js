/**
 * PowOrg WP5 Automated Validation Suite: Measurement & Analytics
 * Spec: claude_website_spec_v2.md (§6.7, §6.6, §7.2 WP5, §8 B1, B2, B4)
 * Instructions: antigravity_wp5_2026-10-30.txt
 */

const path = require('path');
const fs = require('fs');
const http = require('http');

let puppeteer;
try {
  puppeteer = require('puppeteer-core');
} catch (e) {
  const tempPuppeteer = path.join(process.env.TEMP, 'node_modules', 'puppeteer-core');
  puppeteer = require(tempPuppeteer);
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const projectDir = path.resolve(__dirname, '..');
const siteDir = path.join(projectDir, '_site');
const siteStubDir = path.join(projectDir, '_site_stub');
const siteDummyDir = path.join(projectDir, '_site_dummy');
const resultsFile = path.join(projectDir, '_dev', 'wp5_validation_results.json');

const WEB_PORT = 4002;
const STUB_PORT = 4005;
const baseUrl = `http://127.0.0.1:${WEB_PORT}`;

const { startStubServer, setMode, clearRequestsLog } = require('./lead_stub_server');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function startWebServer() {
  const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];

    let targetBaseDir = siteDir;
    if (reqUrl.startsWith('/stub-contact')) {
      targetBaseDir = siteStubDir;
      reqUrl = reqUrl.replace('/stub-contact', '/contact');
    } else if (reqUrl.startsWith('/dummy-site')) {
      targetBaseDir = siteDummyDir;
      reqUrl = reqUrl.replace('/dummy-site', '');
    }

    if (reqUrl.endsWith('/')) {
      reqUrl += 'index.html';
    } else if (!path.extname(reqUrl)) {
      reqUrl += '/index.html';
    }

    const filePath = path.join(targetBaseDir, reqUrl);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`Not found: ${req.url}`);
        return;
      }
      const ext = path.extname(filePath);
      const mime = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(WEB_PORT, '127.0.0.1', () => {
      console.log(`Web server listening on ${baseUrl}`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

const ALLOWED_KEYS = new Set(['page', 'lang', 'location', 'target', 'intent', 'slug', 'from', 'error_type']);
const PII_FORBIDDEN_VALUES = [
  'ישראל ישראלי',
  'test@example.com',
  'ארגון בדיקה',
  '050-1234567',
  'בדיקת תוכן',
  'google',
  'cpc',
  'spring2026'
];

async function runValidation() {
  console.log('=== Starting WP5 Validation Suite ===');

  const webServer = await startWebServer();
  const stubServer = await startStubServer(STUB_PORT);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const testResults = {
    timestamp: new Date().toISOString(),
    site_js_size_bytes: fs.statSync(path.join(projectDir, 'assets', 'js', 'site.js')).size,
    events_captured: {},
    all_debug_lines: [],
    pii_violations: [],
    network_requests_empty_token: [],
    dummy_token_test: {},
    summary: {
      total_events_required: 11,
      events_tested: 0,
      passed: true
    }
  };

  const capturedEvents = [];

  function setupConsoleListener(page) {
    page.on('console', msg => {
      const text = msg.text();
      if (text.startsWith('[track] ')) {
        const parts = text.slice(8).trim().split(' ');
        const eventName = parts[0];
        const jsonStr = parts.slice(1).join(' ');
        try {
          const payload = JSON.parse(jsonStr);
          const entry = {
            event: eventName,
            payload,
            raw: text
          };
          capturedEvents.push(entry);
          testResults.all_debug_lines.push(text);
          if (!testResults.events_captured[eventName]) {
            testResults.events_captured[eventName] = [];
          }
          testResults.events_captured[eventName].push(payload);
        } catch (e) {
          console.error('Failed to parse track json:', text, e);
        }
      }
    });
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    setupConsoleListener(page);

    console.log('\n--- 1. Testing Page Views: scenario_view, domain_view, contact_view ---');

    // 1.1 scenario_view
    await page.goto(`${baseUrl}/scenarios/recording-to-outputs/?debug=track`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 100));

    // 1.2 domain_view
    await page.goto(`${baseUrl}/solutions/customers/?debug=track`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 100));

    // 1.3 contact_view with from
    await page.goto(`${baseUrl}/contact/?from=scenario:recording-to-outputs&debug=track`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 100));

    // 1.4 contact_view direct
    await page.goto(`${baseUrl}/contact/?debug=track`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 100));

    console.log('\n--- 2. Testing form_start ---');
    // On contact page: focus name field, should trigger form_start once
    const eventsBeforeFocus = capturedEvents.filter(e => e.event === 'form_start').length;
    await page.focus('#contact-name');
    await page.type('#contact-name', 'ישראל ישראלי');
    await new Promise(r => setTimeout(r, 100));
    const eventsAfterFirstInput = capturedEvents.filter(e => e.event === 'form_start').length;
    if (eventsAfterFirstInput !== eventsBeforeFocus + 1) {
      throw new Error(`form_start did not trigger exactly once on first input (before: ${eventsBeforeFocus}, after: ${eventsAfterFirstInput})`);
    }

    // Secondary interaction on another field should NOT trigger form_start again
    await page.focus('#contact-email');
    await page.type('#contact-email', 'test@example.com');
    await new Promise(r => setTimeout(r, 100));
    const eventsAfterSecondInput = capturedEvents.filter(e => e.event === 'form_start').length;
    if (eventsAfterSecondInput !== eventsAfterFirstInput) {
      throw new Error(`form_start triggered multiple times! (count: ${eventsAfterSecondInput})`);
    }

    console.log('\n--- 3. Testing Click Events: cta_click, entry_choice, lang_switch ---');
    await page.goto(`${baseUrl}/?debug=track`, { waitUntil: 'domcontentloaded' });

    // Intercept navigation on clicks to stay on the page while capturing logs
    await page.evaluate(() => {
      document.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', e => {
          e.preventDefault();
        }, false);
      });
    });

    // 3.1 cta_click (hero)
    await page.click('[data-track-location="hero"]');
    await new Promise(r => setTimeout(r, 50));

    // 3.2 cta_click (header)
    await page.click('#desktop-cta');
    await new Promise(r => setTimeout(r, 50));

    // 3.3 cta_click (cta-band)
    await page.click('[data-track-location="cta-band"]');
    await new Promise(r => setTimeout(r, 50));

    // 3.4 entry_choice (defined_process & explore)
    await page.click('[data-track-intent="defined_process"]');
    await new Promise(r => setTimeout(r, 50));
    await page.click('[data-track-intent="explore"]');
    await new Promise(r => setTimeout(r, 50));

    // 3.5 lang_switch
    await page.click('.lang-switch');
    await new Promise(r => setTimeout(r, 50));

    // 3.6 cta_click (scenario-hero)
    await page.goto(`${baseUrl}/scenarios/recording-to-outputs/?debug=track`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      document.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', e => e.preventDefault(), false);
      });
    });
    await page.click('[data-track-location="scenario-hero"]');
    await new Promise(r => setTimeout(r, 50));

    console.log('\n--- 4. Testing Form Submission & Lead Events (Success & Errors) ---');

    // 4.1 Success Flow (stub 200)
    setMode('200');
    await page.goto(`${baseUrl}/stub-contact/?debug=track`, { waitUntil: 'domcontentloaded' });
    await page.type('#contact-name', 'ישראל ישראלי');
    await page.type('#contact-email', 'test@example.com');
    await page.type('#contact-org', 'ארגון בדיקה');
    await page.click('#submit-btn');
    await page.waitForSelector('#state-success:not(.is-hidden)', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 100));

    // Verify form_submit and lead_submit_success occurred
    const hasFormSubmit = capturedEvents.some(e => e.event === 'form_submit');
    const hasLeadSuccess = capturedEvents.some(e => e.event === 'lead_submit_success');
    if (!hasFormSubmit || !hasLeadSuccess) {
      throw new Error('form_submit or lead_submit_success missing in success flow');
    }

    // 4.2 Error Flow: http_500
    setMode('500');
    await page.goto(`${baseUrl}/stub-contact/?debug=track`, { waitUntil: 'domcontentloaded' });
    const successCountBefore500 = capturedEvents.filter(e => e.event === 'lead_submit_success').length;
    await page.type('#contact-name', 'ישראל ישראלי');
    await page.type('#contact-email', 'test@example.com');
    await page.type('#contact-org', 'ארגון בדיקה');
    await page.click('#submit-btn');
    await page.waitForSelector('#state-failed:not(.is-hidden)', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 100));

    // Assert NO lead_submit_success emitted during 500 error!
    const successCountAfter500 = capturedEvents.filter(e => e.event === 'lead_submit_success').length;
    if (successCountAfter500 !== successCountBefore500) {
      throw new Error(`CRITICAL: lead_submit_success was emitted on HTTP 500 error!`);
    }

    // 4.3 email_fallback_click from error state
    await page.evaluate(() => {
      const btn = document.getElementById('btn-mailto-fallback');
      if (btn) btn.addEventListener('click', e => e.preventDefault(), false);
    });
    await page.click('#btn-mailto-fallback');
    await new Promise(r => setTimeout(r, 50));

    // 4.4 Error Flow: network disconnect
    setMode('disconnect');
    await page.goto(`${baseUrl}/stub-contact/?debug=track`, { waitUntil: 'domcontentloaded' });
    await page.type('#contact-name', 'ישראל ישראלי');
    await page.type('#contact-email', 'test@example.com');
    await page.type('#contact-org', 'ארגון בדיקה');
    await page.click('#submit-btn');
    await page.waitForSelector('#state-failed:not(.is-hidden)', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 100));

    // 4.5 Error Flow: rejected (200 with ok: false)
    setMode('rejected');
    await page.goto(`${baseUrl}/stub-contact/?debug=track`, { waitUntil: 'domcontentloaded' });
    await page.type('#contact-name', 'ישראל ישראלי');
    await page.type('#contact-email', 'test@example.com');
    await page.type('#contact-org', 'ארגון בדיקה');
    await page.click('#submit-btn');
    await page.waitForSelector('#state-failed:not(.is-hidden)', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 100));

    // 4.6 email_fallback_click from direct mail link
    await page.goto(`${baseUrl}/contact/?debug=track`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      document.querySelectorAll('.direct-mail-link').forEach(a => {
        a.addEventListener('click', e => e.preventDefault(), false);
      });
    });
    await page.click('.direct-mail-link');
    await new Promise(r => setTimeout(r, 50));

    console.log('\n--- 5. PII & Whitelist Validation across all captured events ---');
    for (const item of capturedEvents) {
      const payloadKeys = Object.keys(item.payload);
      for (const k of payloadKeys) {
        if (!ALLOWED_KEYS.has(k)) {
          testResults.pii_violations.push({
            event: item.event,
            reason: `Disallowed parameter key: "${k}"`,
            payload: item.payload
          });
        }
      }

      const serialized = JSON.stringify(item.payload);
      for (const pii of PII_FORBIDDEN_VALUES) {
        if (serialized.includes(pii)) {
          testResults.pii_violations.push({
            event: item.event,
            reason: `PII leaked into event payload: "${pii}"`,
            payload: item.payload
          });
        }
      }
    }

    console.log('\n--- 6. Network Requests Audit (Empty Token) ---');
    const pageNetwork = await browser.newPage();
    const networkRequests = [];
    pageNetwork.on('request', req => {
      networkRequests.push({
        url: req.url(),
        method: req.method(),
        resourceType: req.resourceType()
      });
    });

    await pageNetwork.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });
    await pageNetwork.goto(`${baseUrl}/contact/`, { waitUntil: 'networkidle0' });

    testResults.network_requests_empty_token = networkRequests;
    const analyticsRequests = networkRequests.filter(r =>
      r.url.includes('cloudflareinsights') ||
      r.url.includes('google-analytics') ||
      r.url.includes('beacon')
    );

    if (analyticsRequests.length > 0) {
      throw new Error(`Found analytics requests when token is empty: ${JSON.stringify(analyticsRequests)}`);
    }

    console.log('\n--- 7. Dummy Token Tag Generation & Request Interception ---');
    const pageDummy = await browser.newPage();
    await pageDummy.setRequestInterception(true);
    let interceptedBeacon = null;

    pageDummy.on('request', interceptedReq => {
      if (interceptedReq.url().includes('cloudflareinsights.com')) {
        interceptedBeacon = {
          url: interceptedReq.url(),
          method: interceptedReq.method(),
          headers: interceptedReq.headers(),
          intercepted: true,
          aborted: true
        };
        console.log(`[INTERCEPTED & ABORTED] ${interceptedReq.url()}`);
        interceptedReq.abort();
      } else {
        interceptedReq.continue();
      }
    });

    await pageDummy.goto(`${baseUrl}/dummy-site/`, { waitUntil: 'networkidle0' });

    const beaconTag = await pageDummy.evaluate(() => {
      const el = document.querySelector('script[src*="cloudflareinsights.com"]');
      if (!el) return null;
      return {
        src: el.getAttribute('src'),
        defer: el.hasAttribute('defer'),
        cfBeacon: el.getAttribute('data-cf-beacon')
      };
    });

    // Check styleguide has NO beacon
    await pageDummy.goto(`${baseUrl}/dummy-site/styleguide/`, { waitUntil: 'networkidle0' });
    const beaconInStyleguide = await pageDummy.evaluate(() => {
      return !!document.querySelector('script[src*="cloudflareinsights.com"]');
    });

    // Check 404 has NO beacon
    await pageDummy.goto(`${baseUrl}/dummy-site/404.html`, { waitUntil: 'networkidle0' });
    const beaconIn404 = await pageDummy.evaluate(() => {
      return !!document.querySelector('script[src*="cloudflareinsights.com"]');
    });

    testResults.dummy_token_test = {
      beacon_tag_on_home: beaconTag,
      intercepted_request: interceptedBeacon,
      beacon_excluded_on_styleguide: !beaconInStyleguide,
      beacon_excluded_on_404: !beaconIn404,
      passed: !!(beaconTag && beaconTag.cfBeacon && interceptedBeacon && !beaconInStyleguide && !beaconIn404)
    };

    console.log('\n--- Summary Evaluation ---');
    const requiredEvents = [
      'cta_click',
      'entry_choice',
      'scenario_view',
      'domain_view',
      'contact_view',
      'form_start',
      'form_submit',
      'lead_submit_success',
      'lead_submit_error',
      'email_fallback_click',
      'lang_switch'
    ];

    const capturedEventNames = Object.keys(testResults.events_captured);
    testResults.summary.events_tested = capturedEventNames.length;
    testResults.summary.missing_events = requiredEvents.filter(ev => !capturedEventNames.includes(ev));

    if (testResults.summary.missing_events.length > 0) {
      testResults.summary.passed = false;
      console.error('Missing events:', testResults.summary.missing_events);
    }

    if (testResults.pii_violations.length > 0) {
      testResults.summary.passed = false;
      console.error('PII violations:', testResults.pii_violations);
    }

    if (testResults.site_js_size_bytes > 15360) {
      testResults.summary.passed = false;
      console.error(`site.js exceeds 15KB: ${testResults.site_js_size_bytes} > 15360`);
    }

    if (!testResults.dummy_token_test.passed) {
      testResults.summary.passed = false;
      console.error('Dummy token test failed:', testResults.dummy_token_test);
    }

    fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2), 'utf8');
    console.log(`\nValidation complete. Summary passed: ${testResults.summary.passed}`);
    console.log(`Results saved to ${resultsFile}`);

  } finally {
    await browser.close();
    webServer.close();
    stubServer.close();
  }
}

if (require.main === module) {
  runValidation().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('Validation failed with error:', err);
    process.exit(1);
  });
}

module.exports = { runValidation };
