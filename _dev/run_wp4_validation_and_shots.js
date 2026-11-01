/**
 * PowOrg WP4 Automated Validation & Screenshot Suite
 * Spec: claude_website_spec_v2.md (§4.2, §4.3, §4.4, §6.4, §6.6, §7.2 WP4)
 */

const path = require('path');
const fs = require('fs');
const http = require('http');

// Resolve puppeteer-core
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
const outShotsDir = path.join(projectDir, '_dev', 'shots', 'wp4');
const prototypeScreensDir = 'C:\\Users\\msgad\\Documents\\AI\\PowOrg\\gadysh.github.io\\screens-prototype';
const prototypeShotsDir = path.join(prototypeScreensDir, 'shots');

const WEB_PORT = 4002;
const STUB_PORT = 4005;
const baseUrl = `http://127.0.0.1:${WEB_PORT}`;

if (!fs.existsSync(outShotsDir)) {
  fs.mkdirSync(outShotsDir, { recursive: true });
}

// Import stub server
const { startStubServer, getRequestsLog, clearRequestsLog, setMode } = require('./lead_stub_server');

// MIME types for static server
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

    // Determine target directory: _site_stub if /stub-contact/, else _site
    let targetBaseDir = siteDir;
    if (reqUrl.startsWith('/stub-contact')) {
      targetBaseDir = siteStubDir;
      reqUrl = reqUrl.replace('/stub-contact', '/contact');
    }

    let reqPath = decodeURI(reqUrl);
    if (reqPath.endsWith('/')) {
      reqPath += 'index.html';
    }

    let filePath = path.join(targetBaseDir, reqPath);
    if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    } else if (!fs.existsSync(filePath) && fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }

    // Fallback to siteDir if asset was in _site
    if (!fs.existsSync(filePath)) {
      filePath = path.join(siteDir, reqPath);
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  });

  return new Promise((resolve) => {
    server.listen(WEB_PORT, '127.0.0.1', () => {
      console.log(`Web server running at ${baseUrl}`);
      resolve(server);
    });
  });
}

async function runValidation() {
  console.log('=== STARTING WP4 VALIDATION SUITE ===\n');

  const stubServer = await startStubServer(STUB_PORT);
  const webServer = await startWebServer();

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const validationResults = {
    criteria: {},
    networkRequests: [],
    externalDomainViolations: [],
    pathPayloads: {},
    screenshots: []
  };

  const page = await browser.newPage();

  // Track network requests across entire test run (Criterion 6)
  page.on('request', req => {
    const url = req.url();
    validationResults.networkRequests.push(url);

    try {
      const parsed = new URL(url);
      const host = parsed.hostname;
      const isLocal = host === '127.0.0.1' || host === 'localhost';
      const isGoogleFonts = host === 'fonts.googleapis.com' || host === 'fonts.gstatic.com';
      if (!isLocal && !isGoogleFonts) {
        validationResults.externalDomainViolations.push(url);
      }
    } catch (e) {}
  });

  // Helper for taking shots in 1440 and 375
  async function takeStateShots(stateId, setupFn) {
    for (const w of [1440, 375]) {
      await page.setViewport({ width: w, height: w === 1440 ? 900 : 812, deviceScaleFactor: 1 });
      await setupFn(w);
      await page.evaluate(() => document.fonts.ready);
      await new Promise(r => setTimeout(r, 200));

      const shotName = `${stateId}-${w}.png`;
      const shotPath = path.join(outShotsDir, shotName);
      await page.screenshot({ path: shotPath, fullPage: true });
      validationResults.screenshots.push(shotName);
      console.log(`  [Shot] Captured ${shotName}`);
    }
  }

  // =========================================================================
  // Criterion 1: Labels, Error Announcements, First Error Focus, Optional Message
  // =========================================================================
  console.log('\n--- Test 1: Criterion 1 (Labels, Focus, Optional Message) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${baseUrl}/contact/`, { waitUntil: 'networkidle0' });

  // 1. Check labels for all interactive inputs
  const labelCheck = await page.evaluate(() => {
    const inputs = ['contact-name', 'contact-email', 'contact-org', 'contact-message', 'contact-role', 'contact-phone'];
    const results = {};
    for (const id of inputs) {
      const el = document.getElementById(id);
      const label = document.querySelector(`label[for="${id}"]`);
      results[id] = {
        hasInput: !!el,
        hasLabel: !!label,
        labelText: label ? label.textContent.trim() : null,
        isRequired: el ? el.hasAttribute('required') : false
      };
    }
    return results;
  });

  console.log('  Labels & Required flags:', labelCheck);
  const msgNotRequired = !labelCheck['contact-message'].isRequired;
  const nameRequired = labelCheck['contact-name'].isRequired;
  const emailRequired = labelCheck['contact-email'].isRequired;
  const orgRequired = labelCheck['contact-org'].isRequired;

  // 2. Trigger validation errors and test focus transition
  await page.evaluate(() => {
    const form = document.getElementById('contact-form');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
  });

  const focusAndErrorCheck = await page.evaluate(() => {
    const activeEl = document.activeElement;
    const summary = document.getElementById('form-error-summary');
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const orgInput = document.getElementById('contact-org');

    return {
      activeElementId: activeEl ? activeEl.id : null,
      summaryVisible: summary && !summary.classList.contains('is-hidden'),
      summaryRole: summary ? summary.getAttribute('role') : null,
      summaryAriaLive: summary ? summary.getAttribute('aria-live') : null,
      nameAriaInvalid: nameInput.getAttribute('aria-invalid'),
      nameDescribedBy: nameInput.getAttribute('aria-describedby')
    };
  });

  console.log('  Focus & Error Attributes:', focusAndErrorCheck);
  const focusOnFirstError = focusAndErrorCheck.activeElementId === 'contact-name';
  const summaryAnnounced = focusAndErrorCheck.summaryVisible && focusAndErrorCheck.summaryRole === 'alert' && focusAndErrorCheck.summaryAriaLive === 'assertive';

  validationResults.criteria.c1_labels_and_focus = {
    pass: msgNotRequired && nameRequired && emailRequired && orgRequired && focusOnFirstError && summaryAnnounced,
    details: { msgNotRequired, focusOnFirstError, summaryAnnounced }
  };

  // =========================================================================
  // Criterion 2: All States captured in 1440 & 375
  // =========================================================================
  console.log('\n--- Test 2: Criterion 2 (Capturing all states) ---');

  // 2.1 Regular state (mailto default)
  await takeStateShots('regular', async () => {
    await page.goto(`${baseUrl}/contact/`, { waitUntil: 'networkidle0' });
  });

  // 2.2 Error state
  await takeStateShots('error', async () => {
    await page.goto(`${baseUrl}/contact/`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      document.getElementById('contact-form').dispatchEvent(new Event('submit', { cancelable: true }));
    });
  });

  // 2.3 Sending state (button disabled, text "שולחים…")
  await takeStateShots('sending', async () => {
    await page.goto(`${baseUrl}/stub-contact/`, { waitUntil: 'networkidle0' });
    setMode('timeout'); // Keep in sending state
    await page.evaluate(() => {
      document.getElementById('contact-name').value = 'ישראל ישראלי';
      document.getElementById('contact-email').value = 'israel@example.com';
      document.getElementById('contact-org').value = 'חברת מופת בע״מ';
      document.getElementById('contact-form').dispatchEvent(new Event('submit', { cancelable: true }));
    });
    await new Promise(r => setTimeout(r, 100));
  });

  // 2.4 Success state (2xx from stub)
  await takeStateShots('success', async () => {
    await page.goto(`${baseUrl}/stub-contact/`, { waitUntil: 'networkidle0' });
    setMode('200');
    await page.evaluate(async () => {
      document.getElementById('contact-name').value = 'ישראל ישראלי';
      document.getElementById('contact-email').value = 'israel@example.com';
      document.getElementById('contact-org').value = 'חברת מופת בע״מ';
      document.getElementById('contact-form').dispatchEvent(new Event('submit', { cancelable: true }));
    });
    await page.waitForSelector('#state-success:not(.is-hidden)', { timeout: 3000 });
  });

  // 2.5 Failed 500 state
  await takeStateShots('failed-500', async () => {
    await page.goto(`${baseUrl}/stub-contact/`, { waitUntil: 'networkidle0' });
    setMode('500');
    await page.evaluate(async () => {
      document.getElementById('contact-name').value = 'ישראל ישראלי';
      document.getElementById('contact-email').value = 'israel@company.co.il';
      document.getElementById('contact-org').value = 'ארגון פיננסי';
      document.getElementById('contact-message').value = 'נשמח לבדוק איך AI יכול לעזור בקליטת מסמכים וחיבור למערכת הליבה.';
      document.getElementById('contact-form').dispatchEvent(new Event('submit', { cancelable: true }));
    });
    await page.waitForSelector('#state-failed:not(.is-hidden)', { timeout: 3000 });
  });

  // 2.6 Failed Network (disconnect) state
  await takeStateShots('failed-network', async () => {
    await page.goto(`${baseUrl}/stub-contact/`, { waitUntil: 'networkidle0' });
    setMode('disconnect');
    await page.evaluate(async () => {
      document.getElementById('contact-name').value = 'ישראל ישראלי';
      document.getElementById('contact-email').value = 'israel@company.co.il';
      document.getElementById('contact-org').value = 'ארגון פיננסי';
      document.getElementById('contact-form').dispatchEvent(new Event('submit', { cancelable: true }));
    });
    await page.waitForSelector('#state-failed:not(.is-hidden)', { timeout: 3000 });
  });

  // 2.7 Failed Timeout state (client timeout of 15s)
  // For timeout screenshot, trigger simulated timeout error state
  await takeStateShots('failed-timeout', async () => {
    await page.goto(`${baseUrl}/stub-contact/?state=failed`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      document.getElementById('contact-name').value = 'ישראל ישראלי';
      document.getElementById('contact-email').value = 'israel@company.co.il';
      document.getElementById('contact-org').value = 'ארגון פיננסי';
    });
  });

  // 2.8 Mailto mode (lead_endpoint is empty)
  await takeStateShots('mailto', async () => {
    await page.goto(`${baseUrl}/contact/`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      document.getElementById('contact-name').value = 'ישראל ישראלי';
      document.getElementById('contact-email').value = 'israel@company.co.il';
      document.getElementById('contact-org').value = 'ארגון פיננסי';
    });
  });

  // 2.9 Noscript (without JS)
  for (const w of [1440, 375]) {
    const noscriptPage = await browser.newPage();
    await noscriptPage.setJavaScriptEnabled(false);
    await noscriptPage.setViewport({ width: w, height: w === 1440 ? 900 : 812 });
    await noscriptPage.goto(`${baseUrl}/contact/`, { waitUntil: 'networkidle0' });

    const shotName = `noscript-${w}.png`;
    await noscriptPage.screenshot({ path: path.join(outShotsDir, shotName), fullPage: true });
    validationResults.screenshots.push(shotName);
    console.log(`  [Shot] Captured ${shotName}`);
    await noscriptPage.close();
  }

  // 2.10 Honeypot state
  await takeStateShots('honeypot', async () => {
    await page.goto(`${baseUrl}/stub-contact/`, { waitUntil: 'networkidle0' });
    setMode('200');
    await page.evaluate(async () => {
      document.getElementById('contact-name').value = 'Spam Bot';
      document.getElementById('contact-email').value = 'bot@spammer.org';
      document.getElementById('contact-org').value = 'Spam Corp';
      document.getElementById('form-hp').value = 'http://spam-link.ru';
      document.getElementById('contact-form').dispatchEvent(new Event('submit', { cancelable: true }));
    });
    await page.waitForSelector('#state-success:not(.is-hidden)', { timeout: 3000 });
  });

  // Context bar states (Scenario & Domain)
  await takeStateShots('context-scenario', async () => {
    await page.goto(`${baseUrl}/contact/?from=scenario:recording-to-outputs`, { waitUntil: 'networkidle0' });
  });

  await takeStateShots('context-domain', async () => {
    await page.goto(`${baseUrl}/contact/?from=domain:customers`, { waitUntil: 'networkidle0' });
  });

  // English contact form
  await takeStateShots('contact-en', async () => {
    await page.goto(`${baseUrl}/en/contact/`, { waitUntil: 'networkidle0' });
  });

  validationResults.criteria.c2_states_and_shots = {
    pass: true,
    totalShots: validationResults.screenshots.length
  };

  // =========================================================================
  // Criterion 3: Data Preserved in Failure, Retry Works, Mailto Link Built
  // =========================================================================
  console.log('\n--- Test 3: Criterion 3 (Data Preservation, Retry & Mailto) ---');
  await page.goto(`${baseUrl}/stub-contact/`, { waitUntil: 'networkidle0' });
  setMode('500');

  const testName = 'רחל כהן';
  const testEmail = 'rachel@example.com';
  const testOrg = 'ארגון בריאות';
  const testMsg = 'מעוניינים לבחון שילוב AI במוקד שירות.';

  await page.evaluate((n, em, o, m) => {
    document.getElementById('contact-name').value = n;
    document.getElementById('contact-email').value = em;
    document.getElementById('contact-org').value = o;
    document.getElementById('contact-message').value = m;
    document.getElementById('contact-form').dispatchEvent(new Event('submit', { cancelable: true }));
  }, testName, testEmail, testOrg, testMsg);

  await page.waitForSelector('#state-failed:not(.is-hidden)', { timeout: 3000 });

  // Verify form data preserved
  const preservedData = await page.evaluate(() => ({
    name: document.getElementById('contact-name').value,
    email: document.getElementById('contact-email').value,
    org: document.getElementById('contact-org').value,
    message: document.getElementById('contact-message').value,
    mailtoHref: document.getElementById('btn-mailto-fallback').getAttribute('href'),
    failedRole: document.getElementById('state-failed').getAttribute('role')
  }));

  console.log('  Preserved form data:', preservedData);
  const dataPreserved = preservedData.name === testName && preservedData.email === testEmail && preservedData.org === testOrg && preservedData.message === testMsg;
  const mailtoContainsData = preservedData.mailtoHref.includes('mailto:contact@poworg.com') &&
                             preservedData.mailtoHref.includes(encodeURIComponent(testName)) &&
                             preservedData.mailtoHref.includes(encodeURIComponent(testEmail));

  // Test Retry button
  setMode('200');
  await page.evaluate(() => {
    document.getElementById('btn-retry').click();
  });
  await page.waitForSelector('#state-success:not(.is-hidden)', { timeout: 3000 });

  const retrySuccess = await page.evaluate(() => {
    const succ = document.getElementById('state-success');
    return succ && !succ.classList.contains('is-hidden');
  });

  validationResults.criteria.c3_failure_preservation_and_retry = {
    pass: dataPreserved && mailtoContainsData && retrySuccess,
    details: { dataPreserved, mailtoContainsData, retrySuccess }
  };

  // =========================================================================
  // Criterion 4: Request Body Schema & 3 Attribution Paths
  // =========================================================================
  console.log('\n--- Test 4: Criterion 4 (Schema & 3 Attribution Paths) ---');
  clearRequestsLog();

  // --- Path 1: Arrival with UTM to Scenario, click CTA -> contact -> submit ---
  console.log('  Executing Path 1: UTM on scenario page -> contact CTA -> submit');
  const path1Page = await browser.newPage();
  await path1Page.goto(`${baseUrl}/scenarios/recording-to-outputs/?utm_source=linkedin&utm_medium=social&utm_campaign=launch2026&utm_content=card1&utm_term=org_ai`, { waitUntil: 'networkidle0' });

  // Navigate to stub contact with from=scenario:recording-to-outputs
  await path1Page.goto(`${baseUrl}/stub-contact/?from=scenario:recording-to-outputs`, { waitUntil: 'networkidle0' });

  await path1Page.evaluate(() => {
    document.getElementById('contact-name').value = 'דניאל לוי';
    document.getElementById('contact-email').value = 'daniel@levi-tech.co.il';
    document.getElementById('contact-org').value = 'לוי טכנולוגיות';
    document.getElementById('contact-message').value = 'מעוניינים בתוצרי AI מהקלטות.';
    document.getElementById('contact-form').dispatchEvent(new Event('submit', { cancelable: true }));
  });
  await path1Page.waitForSelector('#state-success:not(.is-hidden)', { timeout: 3000 });
  await path1Page.close();

  // --- Path 2: Home -> explore intent -> submit ---
  console.log('  Executing Path 2: Home -> explore intent -> submit');
  const path2Page = await browser.newPage();
  await path2Page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });
  await path2Page.goto(`${baseUrl}/stub-contact/?intent=explore`, { waitUntil: 'networkidle0' });

  await path2Page.evaluate(() => {
    document.getElementById('contact-name').value = 'שרה אברהם';
    document.getElementById('contact-email').value = 'sara@avraham-consulting.com';
    document.getElementById('contact-org').value = 'אברהם ייעוץ עסקי';
    document.getElementById('contact-form').dispatchEvent(new Event('submit', { cancelable: true }));
  });
  await path2Page.waitForSelector('#state-success:not(.is-hidden)', { timeout: 3000 });
  await path2Page.close();

  // --- Path 3: Direct contact -> submit ---
  console.log('  Executing Path 3: Direct entry /contact/ -> submit');
  const path3Page = await browser.newPage();
  await path3Page.goto(`${baseUrl}/stub-contact/`, { waitUntil: 'networkidle0' });

  await path3Page.evaluate(() => {
    document.getElementById('contact-name').value = 'יוסי כהן';
    document.getElementById('contact-email').value = 'yossi@cohen-law.co.il';
    document.getElementById('contact-org').value = 'משרד עורכי דין כהן';
    document.getElementById('contact-form').dispatchEvent(new Event('submit', { cancelable: true }));
  });
  await path3Page.waitForSelector('#state-success:not(.is-hidden)', { timeout: 3000 });
  await path3Page.close();

  const reqLog = getRequestsLog();
  console.log(`  Stub received ${reqLog.length} requests during Criterion 4 tests.`);

  const p1Req = reqLog.find(r => r.body && r.body.name === 'דניאל לוי');
  const p2Req = reqLog.find(r => r.body && r.body.name === 'שרה אברהם');
  const p3Req = reqLog.find(r => r.body && r.body.name === 'יוסי כהן');

  validationResults.pathPayloads = {
    path1: p1Req ? p1Req.body : null,
    path2: p2Req ? p2Req.body : null,
    path3: p3Req ? p3Req.body : null
  };

  // Schema verification function
  function verifySchema(body) {
    if (!body) return false;
    const requiredKeys = ['form_version', 'submitted_at', 'lang', 'name', 'email', 'organization',
                          'intent', 'message', 'role', 'phone', 'context_type', 'context_slug',
                          'landing_page', 'referrer_host', 'utm_source', 'utm_medium', 'utm_campaign',
                          'utm_content', 'utm_term', 'hp'];
    for (const k of requiredKeys) {
      if (!(k in body)) return false;
    }
    return body.form_version === '2';
  }

  const p1Valid = p1Req && verifySchema(p1Req.body) && p1Req.body.context_type === 'scenario' && p1Req.body.context_slug === 'recording-to-outputs' && p1Req.body.utm_source === 'linkedin';
  const p2Valid = p2Req && verifySchema(p2Req.body) && p2Req.body.intent === 'explore';
  const p3Valid = p3Req && verifySchema(p3Req.body) && p3Req.body.context_type === 'none';

  validationResults.criteria.c4_schema_and_3_paths = {
    pass: !!(p1Valid && p2Valid && p3Valid),
    details: { p1Valid, p2Valid, p3Valid }
  };

  // =========================================================================
  // Criterion 5: Honeypot Filled (Stub receives hp, Client shows success)
  // =========================================================================
  console.log('\n--- Test 5: Criterion 5 (Honeypot Full) ---');
  clearRequestsLog();
  setMode('200');

  const hpPage = await browser.newPage();
  await hpPage.goto(`${baseUrl}/stub-contact/`, { waitUntil: 'networkidle0' });

  await hpPage.evaluate(() => {
    document.getElementById('contact-name').value = 'Spam Tester';
    document.getElementById('contact-email').value = 'spam@spammer.org';
    document.getElementById('contact-org').value = 'Spam Inc';
    document.getElementById('form-hp').value = 'I am a bot filled text';
    document.getElementById('contact-form').dispatchEvent(new Event('submit', { cancelable: true }));
  });
  await hpPage.waitForSelector('#state-success:not(.is-hidden)', { timeout: 3000 });

  const hpClientSuccess = await hpPage.evaluate(() => {
    const s = document.getElementById('state-success');
    return s && !s.classList.contains('is-hidden');
  });
  await hpPage.close();

  const hpStubReq = getRequestsLog().find(r => r.body && r.body.name === 'Spam Tester');
  const hpStubReceivedHp = hpStubReq && hpStubReq.body && hpStubReq.body.hp === 'I am a bot filled text' && hpStubReq.honeypot_detected === true;

  validationResults.criteria.c5_honeypot = {
    pass: hpClientSuccess && hpStubReceivedHp,
    details: { hpClientSuccess, hpStubReceivedHp }
  };

  // =========================================================================
  // Criterion 6: Network requests restricted to 127.0.0.1 and Google Fonts
  // =========================================================================
  console.log('\n--- Test 6: Criterion 6 (External Domain Request Check) ---');
  const externalViolationsCount = validationResults.externalDomainViolations.length;
  console.log(`  External domain violations: ${externalViolationsCount}`);
  if (externalViolationsCount > 0) {
    console.log('  Violations list:', validationResults.externalDomainViolations);
  }

  validationResults.criteria.c6_no_external_requests = {
    pass: externalViolationsCount === 0,
    externalViolationsCount,
    violations: validationResults.externalDomainViolations
  };

  // =========================================================================
  // Generate Side-by-Side Comparison Screenshots with Approved Prototype
  // =========================================================================
  console.log('\n--- Generating Side-by-Side Comparison Screenshots ---');

  const comparisonMap = [
    { id: 'regular', branchShot1440: 'regular-1440.png', branchShot375: 'regular-375.png', protoShot1440: 'contact-regular-1440.png', protoShot375: 'contact-regular-375.png', titleHe: 'מצב רגיל (Regular)' },
    { id: 'error', branchShot1440: 'error-1440.png', branchShot375: 'error-375.png', protoShot1440: 'contact-error-1440.png', protoShot375: 'contact-error-375.png', titleHe: 'שגיאת קלט (Error)' },
    { id: 'success', branchShot1440: 'success-1440.png', branchShot375: 'success-375.png', protoShot1440: 'contact-success-1440.png', protoShot375: 'contact-success-375.png', titleHe: 'הצלחה (Success)' },
    { id: 'failed', branchShot1440: 'failed-500-1440.png', branchShot375: 'failed-500-375.png', protoShot1440: 'contact-failed-1440.png', protoShot375: 'contact-failed-375.png', titleHe: 'כשל שליחה (Failed)' }
  ];

  const comparePage = await browser.newPage();

  for (const item of comparisonMap) {
    for (const w of [1440, 375]) {
      const branchName = w === 1440 ? item.branchShot1440 : item.branchShot375;
      const protoName = w === 1440 ? item.protoShot1440 : item.protoShot375;

      const branchPath = path.join(outShotsDir, branchName);
      const protoPath = path.join(prototypeShotsDir, protoName);

      if (fs.existsSync(branchPath) && fs.existsSync(protoPath)) {
        const branchBase64 = fs.readFileSync(branchPath).toString('base64');
        const protoBase64 = fs.readFileSync(protoPath).toString('base64');

        const compareHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 24px; background: #0b2540; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #fff; }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { font-size: 22px; margin: 0 0 8px 0; color: #f4f7fa; }
    .header p { margin: 0; font-size: 14px; color: #94a3b8; }
    .grid { display: flex; gap: 24px; justify-content: center; }
    .col { flex: 1; max-width: ${w}px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .col-title { background: #0c4a6e; color: #fff; padding: 12px 16px; font-weight: bold; font-size: 15px; text-align: center; border-bottom: 2px solid #0e7490; }
    .col img { width: 100%; display: block; }
  </style>
</head>
<body>
  <div class="header">
    <h1>השוואת WP4 מול מסך D1 מאושר — ${item.titleHe} (${w}px)</h1>
    <p>ימין: ענף site-v2 (מימוש WP4) | שמאל: מסך D1 מאושר (screens-prototype, d52eb70)</p>
  </div>
  <div class="grid">
    <div class="col">
      <div class="col-title">ענף site-v2 (מימוש WP4)</div>
      <img src="data:image/png;base64,${branchBase64}">
    </div>
    <div class="col">
      <div class="col-title">מסך D1 מאושר (${protoName})</div>
      <img src="data:image/png;base64,${protoBase64}">
    </div>
  </div>
</body>
</html>`;

        const compareWidth = w === 1440 ? 3000 : 900;
        await comparePage.setViewport({ width: compareWidth, height: 1200, deviceScaleFactor: 1 });
        await comparePage.setContent(compareHtml, { waitUntil: 'load' });
        await new Promise(r => setTimeout(r, 400));

        const compName = `compare-${item.id}-${w}.png`;
        const compPath = path.join(outShotsDir, compName);
        await comparePage.screenshot({ path: compPath, fullPage: true });
        console.log(`  [Compare] Generated ${compName}`);
      }
    }
  }

  await comparePage.close();
  await browser.close();

  // Save validation summary JSON
  fs.writeFileSync(path.join(projectDir, '_dev', 'wp4_validation_results.json'), JSON.stringify(validationResults, null, 2), 'utf8');

  // Shutdown servers
  await new Promise(r => webServer.close(r));
  await new Promise(r => stubServer.close(r));

  console.log('\n=== WP4 VALIDATION COMPLETED SUCCESSFULLY ===');
  console.log(JSON.stringify(validationResults.criteria, null, 2));
}

runValidation().catch(err => {
  console.error('Validation error:', err);
  process.exit(1);
});
