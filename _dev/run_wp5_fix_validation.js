/**
 * PowOrg WP5-fix (F1/F2) Automated Validation Suite
 * Spec: claude_next_execution_packet_2026-10-30.md
 * Checks: (a) Drawer appearance, (b) lang_switch event, (c) contact_view allowlist, (d) site.js size
 */

const path = require('path');
const fs = require('fs');
const http = require('http');
const { execSync } = require('child_process');

let puppeteer;
try {
  puppeteer = require('puppeteer-core');
} catch (e) {
  const tempPuppeteer = path.join(process.env.TEMP, 'node_modules', 'puppeteer-core');
  puppeteer = require(tempPuppeteer);
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const projectDir = path.resolve(__dirname, '..');
const siteStubDir = path.join(projectDir, '_site_stub');
const shotsDir = path.join(projectDir, '_dev', 'shots', 'wp5fix');
const resultsFile = path.join(projectDir, '_dev', 'wp5_fix_validation_results.json');

const WEB_PORT = 4002;
const baseUrl = `http://127.0.0.1:${WEB_PORT}`;

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
    if (reqUrl.endsWith('/')) {
      reqUrl += 'index.html';
    } else if (!path.extname(reqUrl)) {
      reqUrl += '/index.html';
    }

    const filePath = path.join(siteStubDir, reqUrl);
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
      console.log(`Web server listening on ${baseUrl} (serving _site_stub)`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

async function runValidation() {
  console.log('=== Starting WP5-fix Validation Suite ===');

  if (!fs.existsSync(shotsDir)) {
    fs.mkdirSync(shotsDir, { recursive: true });
  }

  const webServer = await startWebServer();
  let browser;

  const testResults = {
    timestamp: new Date().toISOString(),
    tested_head: '',
    site_js_size_bytes: 0,
    tests: {},
    aborted_requests: [],
    network_summary: {
      cloudflare_requests: 0,
      google_script_requests: 0
    },
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      verdict: 'PENDING'
    }
  };

  try {
    try {
      testResults.tested_head = execSync('git rev-parse HEAD', { cwd: projectDir }).toString().trim();
    } catch (e) {
      testResults.tested_head = 'unknown';
    }

    const siteJsPath = path.join(projectDir, 'assets', 'js', 'site.js');
    const siteJsSize = fs.statSync(siteJsPath).size;
    testResults.site_js_size_bytes = siteJsSize;

    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const allowedHosts = new Set(['127.0.0.1', 'fonts.googleapis.com', 'fonts.gstatic.com']);

    async function createInstrumentedPage() {
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      page.on('request', req => {
        try {
          const urlObj = new URL(req.url());
          if (urlObj.hostname.includes('cloudflareinsights')) {
            testResults.network_summary.cloudflare_requests++;
          }
          if (urlObj.hostname.includes('script.google.com')) {
            testResults.network_summary.google_script_requests++;
          }

          if (allowedHosts.has(urlObj.hostname)) {
            req.continue();
          } else {
            testResults.aborted_requests.push({ url: req.url(), method: req.method() });
            req.abort();
          }
        } catch (e) {
          testResults.aborted_requests.push({ url: req.url(), method: req.method() });
          req.abort();
        }
      });
      return page;
    }

    // -------------------------------------------------------------
    // (a) Drawer appearance (F1)
    // -------------------------------------------------------------
    console.log('\n--- Test (a): Drawer Appearance (F1) ---');
    const propsToCompare = [
      'border-top-width',
      'border-radius',
      'background-color',
      'font-weight',
      'padding-inline-start',
      'min-height'
    ];

    // Helper for comparing drawer links
    async function testDrawerStyle(pageUrl, langTargetHreflang, shotName) {
      const page = await createInstrumentedPage();
      await page.setViewport({ width: 390, height: 844 });
      await page.goto(`${baseUrl}${pageUrl}`, { waitUntil: 'domcontentloaded' });

      // Click drawer toggle button
      await page.waitForSelector('#drawer-toggle-btn');
      await page.click('#drawer-toggle-btn');
      await new Promise(r => setTimeout(r, 400)); // wait for drawer transition

      // Save screenshot
      const shotPath = path.join(shotsDir, shotName);
      await page.screenshot({ path: shotPath });
      console.log(`Saved screenshot: ${shotPath}`);

      // Evaluate computed styles
      const comparison = await page.evaluate((props, targetHreflang) => {
        const langLink = document.querySelector(`ul.drawer-links-direct li a[hreflang="${targetHreflang}"]`);
        const siblingLink = document.querySelector('ul.drawer-links-direct li a[href*="how-we-work"]');

        if (!langLink || !siblingLink) {
          return { error: 'Links not found in ul.drawer-links-direct', langFound: !!langLink, siblingFound: !!siblingLink };
        }

        const langStyle = window.getComputedStyle(langLink);
        const sibStyle = window.getComputedStyle(siblingLink);

        const diffs = {};
        const values = {};
        let allEqual = true;

        props.forEach(p => {
          const lVal = langStyle.getPropertyValue(p);
          const sVal = sibStyle.getPropertyValue(p);
          values[p] = { lang_link: lVal, sibling_link: sVal };
          if (lVal !== sVal) {
            allEqual = false;
            diffs[p] = { lang_link: lVal, sibling_link: sVal };
          }
        });

        return { allEqual, diffs, values };
      }, propsToCompare, langTargetHreflang);

      await page.close();
      return comparison;
    }

    const drawerHeResult = await testDrawerStyle('/', 'en', 'drawer_he_390.png');
    const drawerEnResult = await testDrawerStyle('/en/', 'he', 'drawer_en_390.png');

    const drawerAllEqual = drawerHeResult.allEqual && drawerEnResult.allEqual;
    testResults.tests['a_drawer_appearance'] = {
      expected: 'All 6 computed styles identical between language link and sibling how-we-work link in drawer for both / and /en/',
      measured: {
        he_drawer: drawerHeResult,
        en_drawer: drawerEnResult
      },
      status: drawerAllEqual ? 'PASS' : 'FAIL'
    };
    console.log(`(a) Drawer appearance: ${drawerAllEqual ? 'PASS' : 'FAIL'}`);

    // -------------------------------------------------------------
    // (b) lang_switch event
    // -------------------------------------------------------------
    console.log('\n--- Test (b): lang_switch Event ---');

    // b1: Click drawer language link (viewport 390)
    async function testDrawerLangClick() {
      const page = await createInstrumentedPage();
      await page.setViewport({ width: 390, height: 844 });
      const events = [];
      page.on('console', msg => {
        const text = msg.text();
        if (text.startsWith('[track] ')) events.push(text);
      });

      await page.goto(`${baseUrl}/?debug=track`, { waitUntil: 'domcontentloaded' });
      // Prevent navigation on click
      await page.evaluate(() => {
        window.addEventListener('click', e => {
          if (e.target.closest('a')) e.preventDefault();
        }, true);
      });

      await page.click('#drawer-toggle-btn');
      await new Promise(r => setTimeout(r, 300));
      events.length = 0; // Clear any load events

      await page.click('ul.drawer-links-direct a[hreflang="en"]');
      await new Promise(r => setTimeout(r, 200));

      await page.close();
      return events;
    }

    // b2: Click header EN button (desktop viewport 1280)
    async function testHeaderLangClick() {
      const page = await createInstrumentedPage();
      await page.setViewport({ width: 1280, height: 800 });
      const events = [];
      page.on('console', msg => {
        const text = msg.text();
        if (text.startsWith('[track] ')) events.push(text);
      });

      await page.goto(`${baseUrl}/?debug=track`, { waitUntil: 'domcontentloaded' });
      // Prevent navigation on click
      await page.evaluate(() => {
        window.addEventListener('click', e => {
          if (e.target.closest('a')) e.preventDefault();
        }, true);
      });

      events.length = 0; // Clear any load events

      await page.click('header .lang-switch');
      await new Promise(r => setTimeout(r, 200));

      await page.close();
      return events;
    }

    const drawerClickEvents = await testDrawerLangClick();
    const headerClickEvents = await testHeaderLangClick();

    const drawerClickPass = drawerClickEvents.length === 1 && drawerClickEvents[0].includes('lang_switch');
    const headerClickPass = headerClickEvents.length === 1 && headerClickEvents[0].includes('lang_switch');

    testResults.tests['b_lang_switch_drawer'] = {
      expected: 'Exactly 1 [track] lang_switch event and no other event',
      measured: drawerClickEvents,
      status: drawerClickPass ? 'PASS' : 'FAIL'
    };
    testResults.tests['b_lang_switch_header'] = {
      expected: 'Exactly 1 [track] lang_switch event and no other event',
      measured: headerClickEvents,
      status: headerClickPass ? 'PASS' : 'FAIL'
    };
    console.log(`(b.1) Drawer lang_switch click: ${drawerClickPass ? 'PASS' : 'FAIL'} (${drawerClickEvents.join(', ')})`);
    console.log(`(b.2) Header lang_switch click: ${headerClickPass ? 'PASS' : 'FAIL'} (${headerClickEvents.join(', ')})`);

    // -------------------------------------------------------------
    // (c) contact_view (F2)
    // -------------------------------------------------------------
    console.log('\n--- Test (c): contact_view Allowlist (F2) ---');

    const contactViewCases = [
      {
        name: 'c1_scenario_valid',
        url: '/contact/?from=scenario:recording-to-outputs&debug=track',
        expectedFrom: 'scenario:recording-to-outputs',
        mustNotContain: ['@']
      },
      {
        name: 'c2_raw_email_other',
        url: '/contact/?from=jane@example.com&debug=track',
        expectedFrom: 'other',
        mustNotContain: ['@']
      },
      {
        name: 'c3_scenario_with_email_stripped',
        url: '/contact/?from=scenario:recording-to-outputs:jane@example.com&debug=track',
        expectedFrom: 'scenario:recording-to-outputs',
        mustNotContain: ['@']
      },
      {
        name: 'c4_unknown_slug_other',
        url: '/contact/?from=scenario:no-such-slug&debug=track',
        expectedFrom: 'other',
        mustNotContain: []
      },
      {
        name: 'c5_menu_all_solutions',
        url: '/en/contact/?from=menu:all_solutions&debug=track',
        expectedFrom: 'menu:all_solutions',
        mustNotContain: []
      },
      {
        name: 'c6_empty_from',
        url: '/contact/?debug=track',
        expectedFrom: '',
        mustNotContain: []
      }
    ];

    for (const c of contactViewCases) {
      const page = await createInstrumentedPage();
      await page.setViewport({ width: 1200, height: 800 });
      const trackEvents = [];
      page.on('console', msg => {
        const text = msg.text();
        if (text.startsWith('[track] ')) {
          trackEvents.push(text);
        }
      });

      await page.goto(`${baseUrl}${c.url}`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 150));

      // Filter events
      const contactViewEvents = trackEvents.filter(t => t.includes('contact_view'));
      const formStartEvents = trackEvents.filter(t => t.includes('form_start'));

      let cvPayload = null;
      if (contactViewEvents.length === 1) {
        const raw = contactViewEvents[0];
        const jsonStr = raw.replace(/^\[track\]\s+contact_view\s+/, '');
        try {
          cvPayload = JSON.parse(jsonStr);
        } catch (e) {}
      }

      const countPass = contactViewEvents.length === 1;
      const noFormStartPass = formStartEvents.length === 0;
      const fromMatchPass = cvPayload && cvPayload.from === c.expectedFrom;
      let noForbiddenStrings = true;
      if (c.mustNotContain && c.mustNotContain.length) {
        const allOutput = trackEvents.join(' ');
        for (const forb of c.mustNotContain) {
          if (allOutput.includes(forb)) {
            noForbiddenStrings = false;
          }
        }
      }

      const casePass = countPass && noFormStartPass && fromMatchPass && noForbiddenStrings;
      testResults.tests[c.name] = {
        url: c.url,
        expected: {
          contact_view_count: 1,
          form_start_on_load: 0,
          from: c.expectedFrom,
          must_not_contain: c.mustNotContain
        },
        measured: {
          contact_view_count: contactViewEvents.length,
          form_start_count: formStartEvents.length,
          from: cvPayload ? cvPayload.from : null,
          raw_events: trackEvents
        },
        status: casePass ? 'PASS' : 'FAIL'
      };

      console.log(`(c) ${c.name}: ${casePass ? 'PASS' : 'FAIL'} (from="${cvPayload ? cvPayload.from : 'none'}", form_start=${formStartEvents.length})`);
      await page.close();
    }

    // -------------------------------------------------------------
    // (d) Size check
    // -------------------------------------------------------------
    console.log('\n--- Test (d): site.js Size Limit ---');
    const sizePass = siteJsSize <= 15360;
    testResults.tests['d_site_js_size'] = {
      expected: '<= 15360 bytes',
      measured: `${siteJsSize} bytes (${15360 - siteJsSize} bytes headroom remaining)`,
      status: sizePass ? 'PASS' : 'FAIL'
    };
    console.log(`(d) Size check: ${sizePass ? 'PASS' : 'FAIL'} (${siteJsSize} bytes, limit: 15360)`);

    // Network check
    const zeroCloudflare = testResults.network_summary.cloudflare_requests === 0;
    const zeroGoogleScript = testResults.network_summary.google_script_requests === 0;
    testResults.tests['network_isolation'] = {
      expected: '0 requests to cloudflareinsights and script.google.com',
      measured: `cloudflare: ${testResults.network_summary.cloudflare_requests}, script.google: ${testResults.network_summary.google_script_requests}`,
      status: (zeroCloudflare && zeroGoogleScript) ? 'PASS' : 'FAIL'
    };

    // Calculate total summary
    let passed = 0, failed = 0;
    for (const [k, v] of Object.entries(testResults.tests)) {
      if (v.status === 'PASS') passed++;
      else failed++;
    }
    testResults.summary.total = passed + failed;
    testResults.summary.passed = passed;
    testResults.summary.failed = failed;
    testResults.summary.verdict = failed === 0 ? 'PASS' : 'FAIL';

    console.log(`\n=== Validation Suite Summary: ${testResults.summary.verdict} (${passed}/${passed + failed} passed) ===`);

    fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2), 'utf8');
    console.log(`Results saved to: ${resultsFile}`);

  } finally {
    if (browser) {
      await browser.close();
    }
    await new Promise(r => webServer.close(r));
    console.log('Web server stopped.');
  }
}

runValidation().catch(err => {
  console.error('Validation error:', err);
  process.exit(1);
});
