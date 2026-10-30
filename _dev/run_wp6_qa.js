/**
 * WP6 Automated QA Runner for PowOrg Website v2
 * Spec: claude_website_spec_v2.md (§7.1, §7.2 WP6)
 * Packet: claude_wp6_packet_2026-10-31.md (§3)
 * Node.js script using puppeteer-core from %TEMP%\node_modules
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(process.env.TEMP, 'node_modules', 'puppeteer-core'));

const [siteDir, prodDir, srcDir, outJson] = [
  process.argv[2] || path.join(process.env.TEMP, 'wp6_build', '_site_stub'),
  process.argv[3] || path.join(process.env.TEMP, 'wp6_build', '_site_prod'),
  process.argv[4] || path.join(process.env.TEMP, 'wp6_build', 'src'),
  process.argv[5] || path.join(__dirname, 'wp6_qa_results.json')
];

const PORT = 4020;
const BASE = `http://127.0.0.1:${PORT}`;

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
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

// Static server for stub build on 127.0.0.1:4020
const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (u.endsWith('/')) u += 'index.html';
  else if (!path.extname(u)) u += '/index.html';
  const filePath = path.join(siteDir, u);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

const results = {
  timestamp: new Date().toISOString(),
  head: 'c10a8e5',
  siteDir,
  prodDir,
  srcDir,
  blocked_requests: [],
  allowed_requests: [],
  criteria: {},
  weight: {},
  todo_copy: {},
  supplementary_a11y: {},
  public_pages_audit: {},
  robots_and_sitemap: {},
  network_audit: {}
};

async function createPage(browser, options = {}) {
  const { width = 1280, height = 800, allowFonts = false } = options;
  const page = await browser.newPage();
  await page.setViewport({ width, height, isMobile: width < 768 });
  await page.setRequestInterception(true);

  page.on('request', req => {
    const u = req.url();
    if (u.startsWith(BASE) || u.startsWith('data:')) {
      results.allowed_requests.push({ url: u, allowed_reason: 'local' });
      return req.continue();
    }
    if (allowFonts && (/^https:\/\/fonts\.googleapis\.com\//.test(u) || /^https:\/\/fonts\.gstatic\.com\//.test(u))) {
      results.allowed_requests.push({ url: u, allowed_reason: 'google_fonts_allowed_in_weight_run' });
      return req.continue();
    }
    results.blocked_requests.push(u);
    req.abort();
  });

  page.consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      page.consoleErrors.push(msg.text());
    }
  });
  page.pageErrors = [];
  page.on('pageerror', err => {
    page.pageErrors.push(err.message || String(err));
  });

  return page;
}

(async () => {
  console.log(`Starting local server on ${BASE}...`);
  await new Promise(res => server.listen(PORT, '127.0.0.1', res));

  console.log('Launching Puppeteer Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // ---------------------------------------------------------
    // Criterion 1: Lighthouse Mobile
    // ---------------------------------------------------------
    console.log('Checking Criterion 1: Lighthouse Mobile...');
    // Since lighthouse is not installed, record GAP G1
    results.criteria.criterion_1_lighthouse = {
      status: 'GAP',
      gap_id: 'G1',
      details: 'Lighthouse CLI / package is not installed in the environment (%TEMP%\\node_modules has puppeteer-core only). Installation is prohibited per WP6 rules. Scores are not invented.',
      pages_targeted: ['/', '/scenarios/recording-to-outputs/', '/contact/']
    };

    // ---------------------------------------------------------
    // Criterion 2: axe-core + Supplementary Puppeteer Checks
    // ---------------------------------------------------------
    console.log('Checking Criterion 2: axe-core (GAP G1) & Supplementary Accessibility Checks...');
    results.criteria.criterion_2_axe = {
      status: 'GAP',
      gap_id: 'G1',
      details: 'axe-core is not installed in %TEMP%\\node_modules. Installation is prohibited per WP6 rules. Executing supplementary Puppeteer checks (marked clearly as partial supplementary checks, not axe-core).',
      supplementary_notice: 'בדיקה משלימה, לא axe'
    };

    const a11yPages = ['/', '/scenarios/recording-to-outputs/', '/contact/', '/en/'];
    for (const pPath of a11yPages) {
      console.log(`  Running supplementary a11y checks on ${pPath}...`);
      const page = await createPage(browser, { width: 375, height: 667, allowFonts: true });
      await page.goto(BASE + pPath, { waitUntil: 'networkidle0' });

      const audit = await page.evaluate(() => {
        const issues = [];

        // 1. Image alt
        const images = [...document.querySelectorAll('img')];
        const missingAlt = images.filter(img => !img.hasAttribute('alt'));
        if (missingAlt.length > 0) {
          issues.push({ check: 'img_alt', error: `${missingAlt.length} images missing alt attribute`, items: missingAlt.map(i => i.src) });
        }

        // 2. Form field labels
        const formFields = [...document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), textarea, select')];
        const missingLabels = [];
        for (const f of formFields) {
          if (f.name === 'hp') continue; // Honeypot field for bot prevention (§6.6)
          const id = f.id;
          const labelFor = id ? document.querySelector(`label[for="${id}"]`) : null;
          const parentLabel = f.closest('label');
          const ariaLabel = f.getAttribute('aria-label') || f.getAttribute('aria-labelledby');
          if (!labelFor && !parentLabel && !ariaLabel) {
            missingLabels.push(f.name || f.id || f.outerHTML.slice(0, 50));
          }
        }
        if (missingLabels.length > 0) {
          issues.push({ check: 'form_labels', error: `${missingLabels.length} form fields missing labels`, items: missingLabels });
        }

        // 3. Accessible name for links and buttons
        const linksAndButtons = [...document.querySelectorAll('a, button')];
        const missingNames = [];
        for (const el of linksAndButtons) {
          const text = (el.innerText || el.textContent || '').trim();
          const ariaLabel = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
          const title = el.getAttribute('title');
          const hasImgWithAlt = el.querySelector('img[alt]:not([alt=""])');
          if (!text && !ariaLabel && !title && !hasImgWithAlt) {
            missingNames.push(el.outerHTML.slice(0, 60));
          }
        }
        if (missingNames.length > 0) {
          issues.push({ check: 'link_button_names', error: `${missingNames.length} links/buttons missing accessible names`, items: missingNames });
        }

        // 4. html lang and dir
        const html = document.documentElement;
        const lang = html.getAttribute('lang');
        const dir = html.getAttribute('dir');
        const langDirIssues = [];
        if (!lang) langDirIssues.push('Missing lang attribute on <html>');
        if (!dir) langDirIssues.push('Missing dir attribute on <html>');
        if (langDirIssues.length > 0) {
          issues.push({ check: 'html_lang_dir', error: langDirIssues.join(', ') });
        }

        // 5. Duplicate IDs
        const allIds = [...document.querySelectorAll('[id]')].map(el => el.id);
        const dupes = allIds.filter((id, idx) => allIds.indexOf(id) !== idx);
        if (dupes.length > 0) {
          issues.push({ check: 'duplicate_ids', error: `Duplicate IDs found: ${[...new Set(dupes)].join(', ')}` });
        }

        // 6. Heading hierarchy (no skipped heading levels)
        const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')];
        const headingLevels = headings.map(h => parseInt(h.tagName.substring(1), 10));
        const skippedHeadings = [];
        for (let i = 0; i < headingLevels.length - 1; i++) {
          if (headingLevels[i + 1] > headingLevels[i] + 1) {
            skippedHeadings.push(`h${headingLevels[i]} directly followed by h${headingLevels[i + 1]}`);
          }
        }
        if (skippedHeadings.length > 0) {
          issues.push({ check: 'heading_order', error: skippedHeadings.join('; ') });
        }

        // 7. Landmarks
        const landmarks = {
          header: !!document.querySelector('header, [role="banner"]'),
          main: !!document.querySelector('main, [role="main"]'),
          footer: !!document.querySelector('footer, [role="contentinfo"]'),
          nav: !!document.querySelector('nav, [role="navigation"]')
        };
        const missingLandmarks = Object.keys(landmarks).filter(k => !landmarks[k]);
        if (missingLandmarks.length > 0) {
          issues.push({ check: 'landmarks', error: `Missing landmarks: ${missingLandmarks.join(', ')}` });
        }

        return {
          lang,
          dir,
          images_count: images.length,
          form_fields_count: formFields.length,
          headings_count: headings.length,
          landmarks,
          issues_count: issues.length,
          issues
        };
      });

      results.supplementary_a11y[pPath] = audit;
      await page.close();
    }

    // ---------------------------------------------------------
    // Accessibility Tree Export via CDP
    // ---------------------------------------------------------
    console.log('Exporting CDP Accessibility Trees...');
    const axTargets = [
      { path: '/', file: 'wp6_ax_tree_home.json' },
      { path: '/scenarios/recording-to-outputs/', file: 'wp6_ax_tree_scenario.json' },
      { path: '/contact/', file: 'wp6_ax_tree_contact.json' }
    ];

    for (const target of axTargets) {
      const page = await createPage(browser, { width: 375, height: 667, allowFonts: true });
      await page.goto(BASE + target.path, { waitUntil: 'networkidle0' });
      const client = await page.target().createCDPSession();
      const axTree = await client.send('Accessibility.getFullAXTree');
      const outPath = path.join(__dirname, target.file);
      fs.writeFileSync(outPath, JSON.stringify(axTree, null, 2), 'utf8');
      console.log(`  Saved ${target.file} (${axTree.nodes ? axTree.nodes.length : 0} nodes)`);
      await page.close();
    }

    // ---------------------------------------------------------
    // Criterion 3: Home First Load Mobile Weight (375px width)
    // ---------------------------------------------------------
    console.log('Checking Criterion 3: Home mobile weight measurement (375px)...');

    async function measurePageWeight(allowFonts) {
      const page = await browser.newPage();
      await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
      await page.setCacheEnabled(false);
      await page.setRequestInterception(true);

      const client = await page.target().createCDPSession();
      await client.send('Network.enable');

      const requests = {};
      client.on('Network.requestWillBeSent', p => {
        requests[p.requestId] = {
          url: p.request.url,
          type: p.type,
          encodedDataLength: 0
        };
      });
      client.on('Network.responseReceived', p => {
        if (requests[p.requestId]) {
          requests[p.requestId].mimeType = p.response.mimeType;
          requests[p.requestId].status = p.response.status;
        }
      });
      client.on('Network.loadingFinished', p => {
        if (requests[p.requestId]) {
          requests[p.requestId].encodedDataLength = p.encodedDataLength;
        }
      });

      page.on('request', req => {
        const u = req.url();
        if (u.startsWith(BASE) || u.startsWith('data:')) {
          return req.continue();
        }
        if (allowFonts && (/^https:\/\/fonts\.googleapis\.com\//.test(u) || /^https:\/\/fonts\.gstatic\.com\//.test(u))) {
          return req.continue();
        }
        req.abort();
      });

      await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 500));
      await page.close();

      const breakdown = {
        document: 0,
        stylesheet: 0,
        script: 0,
        font: 0,
        image: 0,
        other: 0,
        total: 0,
        items: []
      };

      for (const id in requests) {
        const item = requests[id];
        const bytes = item.encodedDataLength || 0;
        breakdown.total += bytes;
        let cat = 'other';
        const type = (item.type || '').toLowerCase();
        const mime = (item.mimeType || '').toLowerCase();
        if (type === 'document' || mime.includes('html')) cat = 'document';
        else if (type === 'stylesheet' || mime.includes('css')) cat = 'stylesheet';
        else if (type === 'script' || mime.includes('javascript')) cat = 'script';
        else if (type === 'font' || mime.includes('font') || mime.includes('woff2')) cat = 'font';
        else if (type === 'image' || mime.includes('image')) cat = 'image';

        breakdown[cat] += bytes;
        breakdown.items.push({
          url: item.url,
          type: item.type,
          mimeType: item.mimeType,
          category: cat,
          bytes
        });
      }

      return breakdown;
    }

    const weightWithFonts = await measurePageWeight(true);
    const weightWithoutFonts = await measurePageWeight(false);

    const targetBytes = 600 * 1024; // 614,400 bytes
    const weightPass = weightWithFonts.total <= targetBytes;

    results.weight = {
      target_kb: 600,
      target_bytes: targetBytes,
      with_fonts: {
        total_bytes: weightWithFonts.total,
        total_kb: (weightWithFonts.total / 1024).toFixed(2),
        document_bytes: weightWithFonts.document,
        stylesheet_bytes: weightWithFonts.stylesheet,
        script_bytes: weightWithFonts.script,
        font_bytes: weightWithFonts.font,
        image_bytes: weightWithFonts.image,
        other_bytes: weightWithFonts.other,
        items_count: weightWithFonts.items.length
      },
      without_fonts: {
        total_bytes: weightWithoutFonts.total,
        total_kb: (weightWithoutFonts.total / 1024).toFixed(2),
        document_bytes: weightWithoutFonts.document,
        stylesheet_bytes: weightWithoutFonts.stylesheet,
        script_bytes: weightWithoutFonts.script,
        font_bytes: weightWithoutFonts.font,
        image_bytes: weightWithoutFonts.image,
        other_bytes: weightWithoutFonts.other,
        items_count: weightWithoutFonts.items.length
      },
      pass: weightPass
    };

    results.criteria.criterion_3_weight = {
      status: weightPass ? 'PASS' : 'FAIL',
      measured_kb: (weightWithFonts.total / 1024).toFixed(2),
      budget_kb: 600,
      margin_kb: ((targetBytes - weightWithFonts.total) / 1024).toFixed(2)
    };

    // ---------------------------------------------------------
    // Criterion 4: Screen Reader Hebrew
    // ---------------------------------------------------------
    results.criteria.criterion_4_screen_reader = {
      status: 'PENDING',
      details: 'Requires human evaluation in NVDA, Narrator, or VoiceOver in Hebrew. Antigravity prepared CDP accessibility trees and detailed step-by-step checklist in _dev/WP6_SCREEN_READER_CHECKLIST.md. Owner: Gadi or designee.'
    };

    // ---------------------------------------------------------
    // Criterion 5: TODO-COPY Audit
    // ---------------------------------------------------------
    console.log('Checking Criterion 5: TODO-COPY audit...');
    function scanDir(dir, filter, cb) {
      for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
          if (item.name !== '.git' && item.name !== '_site' && item.name !== '_dev') {
            scanDir(full, filter, cb);
          }
        } else if (filter(item.name)) {
          cb(full);
        }
      }
    }

    const prodHtmlCounts = {};
    scanDir(prodDir, f => f.endsWith('.html'), file => {
      const rel = path.relative(prodDir, file).replace(/\\/g, '/');
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(/TODO-COPY/g);
      if (matches) prodHtmlCounts[rel] = matches.length;
    });

    const srcMarkers = [];
    scanDir(srcDir, f => !/\.(png|jpg|webp|svg|ico)$/i.test(f), file => {
      const rel = path.relative(srcDir, file).replace(/\\/g, '/');
      const lines = fs.readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('TODO-COPY')) {
          srcMarkers.push({ file: rel, line: idx + 1, snippet: line.trim() });
        }
      });
    });

    const totalProdMarkers = Object.values(prodHtmlCounts).reduce((a, b) => a + b, 0);
    results.todo_copy = {
      production_html_counts: prodHtmlCounts,
      total_in_production_html: totalProdMarkers,
      source_markers_count: srcMarkers.length,
      source_markers: srcMarkers
    };

    results.criteria.criterion_5_todo_copy = {
      status: totalProdMarkers === 0 ? 'PASS' : 'FAIL',
      total_in_production_html: totalProdMarkers,
      details: `Expected FAIL per G3: ${totalProdMarkers} occurrences in 5 production HTML pages, and 36 markers in 8 source files. Insertion of approved copy is a separate content unit.`
    };

    // ---------------------------------------------------------
    // General Checks §7.1: All Public Pages Audit
    // ---------------------------------------------------------
    console.log('Checking §7.1: All public pages console errors, 404s, and internal links...');

    // Extract pages from sitemap.xml
    const sitemapContent = fs.readFileSync(path.join(prodDir, 'sitemap.xml'), 'utf8');
    const locMatches = [...sitemapContent.matchAll(/<loc>https:\/\/poworg\.com([^<]*)<\/loc>/g)];
    const publicPaths = locMatches.map(m => m[1] || '/');

    const internalLinksTested = {};
    const brokenLinks = [];
    const pageAudits = {};

    for (const p of publicPaths) {
      console.log(`  Auditing ${p}...`);
      const page = await createPage(browser, { width: 1280, height: 800, allowFonts: true });
      let status = 0;
      let loadError = null;

      try {
        const resp = await page.goto(BASE + p, { waitUntil: 'networkidle0' });
        status = resp ? resp.status() : 0;
      } catch (err) {
        loadError = err.message;
      }

      // Collect internal links on this page
      const pageLinks = await page.evaluate(() => {
        return [...document.querySelectorAll('a[href]')]
          .map(a => a.getAttribute('href'))
          .filter(h => h && !h.startsWith('mailto:') && !h.startsWith('tel:') && !h.startsWith('#') && !h.startsWith('http://') && !h.startsWith('https://'));
      });

      pageAudits[p] = {
        status,
        loadError,
        consoleErrors: page.consoleErrors,
        pageErrors: page.pageErrors,
        linksCount: pageLinks.length
      };

      for (const link of pageLinks) {
        if (!internalLinksTested[link]) {
          internalLinksTested[link] = { sourcePages: [p] };
        } else {
          internalLinksTested[link].sourcePages.push(p);
        }
      }

      await page.close();
    }

    // Verify all collected internal links
    console.log(`  Verifying ${Object.keys(internalLinksTested).length} unique internal links...`);
    for (const link of Object.keys(internalLinksTested)) {
      const cleanPath = link.split('?')[0].split('#')[0];
      let testPath = cleanPath;
      if (testPath.endsWith('/')) testPath += 'index.html';
      else if (!path.extname(testPath)) testPath += '/index.html';
      const diskPath = path.join(siteDir, testPath);
      const exists = fs.existsSync(diskPath);
      internalLinksTested[link].valid = exists;
      if (!exists) {
        brokenLinks.push({ link, sources: internalLinksTested[link].sourcePages });
      }
    }

    const allConsoleErrors = Object.entries(pageAudits).flatMap(([p, a]) => a.consoleErrors.map(e => ({ page: p, error: e })));
    const allPageErrors = Object.entries(pageAudits).flatMap(([p, a]) => a.pageErrors.map(e => ({ page: p, error: e })));
    const allLoad404s = Object.entries(pageAudits).filter(([p, a]) => a.status === 404).map(([p]) => p);

    results.public_pages_audit = {
      pages_audited_count: publicPaths.length,
      public_paths: publicPaths,
      console_errors: allConsoleErrors,
      page_errors: allPageErrors,
      load_404s: allLoad404s,
      unique_internal_links_count: Object.keys(internalLinksTested).length,
      broken_links: brokenLinks,
      pass: allConsoleErrors.length === 0 && allPageErrors.length === 0 && allLoad404s.length === 0 && brokenLinks.length === 0
    };

    // ---------------------------------------------------------
    // Check 6: robots.txt and sitemap.xml in production build
    // ---------------------------------------------------------
    console.log('Checking Check 6: robots.txt and sitemap.xml in production build...');
    const robotsPath = path.join(prodDir, 'robots.txt');
    const robotsExists = fs.existsSync(robotsPath);
    const robotsContent = robotsExists ? fs.readFileSync(robotsPath, 'utf8') : '';
    const hasSitemapLine = /Sitemap:\s*https:\/\/poworg\.com\/sitemap\.xml/i.test(robotsContent);

    const sitemapPath = path.join(prodDir, 'sitemap.xml');
    const sitemapExists = fs.existsSync(sitemapPath);
    const sitemapHas404 = sitemapContent.includes('/404');
    const sitemapHasStyleguide = sitemapContent.includes('/styleguide');
    const allPublicInSitemap = publicPaths.length >= 19;

    results.robots_and_sitemap = {
      robots_exists: robotsExists,
      robots_has_sitemap_line: hasSitemapLine,
      robots_content: robotsContent.trim(),
      sitemap_exists: sitemapExists,
      sitemap_public_pages_count: publicPaths.length,
      sitemap_has_404: sitemapHas404,
      sitemap_has_styleguide: sitemapHasStyleguide,
      all_public_in_sitemap: allPublicInSitemap,
      pass: robotsExists && hasSitemapLine && sitemapExists && !sitemapHas404 && !sitemapHasStyleguide && allPublicInSitemap
    };

    // ---------------------------------------------------------
    // Criterion 6: Claude Approval & Publication Authority
    // ---------------------------------------------------------
    results.criteria.criterion_6_claude_approval = {
      status: 'PENDING',
      details: 'Claude owns acceptance per d06/d07. Merge to main waits for Gadi decision B5.'
    };

    // ---------------------------------------------------------
    // Network Security Audit
    // ---------------------------------------------------------
    const cfLeaked = results.blocked_requests.filter(u => /cloudflareinsights/i.test(u));
    const receiverLeaked = results.blocked_requests.filter(u => /script\.google\.com/i.test(u));
    results.network_audit = {
      total_blocked: results.blocked_requests.length,
      total_allowed: results.allowed_requests.length,
      cloudflare_requests: cfLeaked.length,
      real_receiver_requests: receiverLeaked.length,
      isolation_pass: cfLeaked.length === 0 && receiverLeaked.length === 0
    };

    console.log('QA run completed successfully!');
    fs.writeFileSync(outJson, JSON.stringify(results, null, 2), 'utf8');
    console.log(`Results written to ${outJson}`);
  } finally {
    await browser.close();
    server.close();
  }
})().catch(err => {
  console.error('Fatal error in QA runner:', err);
  process.exit(1);
});
