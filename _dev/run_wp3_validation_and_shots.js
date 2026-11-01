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
const outShotsDir = path.join(projectDir, '_dev', 'shots', 'wp3');
const prototypeScreensDir = 'C:\\Users\\msgad\\Documents\\AI\\PowOrg\\gadysh.github.io\\screens-prototype';
const prototypeShotsDir = path.join(prototypeScreensDir, 'shots');
const PORT = 4005;
const baseUrl = `http://127.0.0.1:${PORT}`;

if (!fs.existsSync(outShotsDir)) {
  fs.mkdirSync(outShotsDir, { recursive: true });
}

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

function startServer() {
  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath.endsWith('/')) {
      reqPath += 'index.html';
    }
    let filePath = path.join(siteDir, reqPath);
    if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    } else if (!fs.existsSync(filePath) && fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
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
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`Local test server running at ${baseUrl}`);
      resolve(server);
    });
  });
}

// Pages definition
const pagesToTest = [
  { id: 'home', path: '/', protoScreen: 'home.html', proto1440: 'home-1440.png', proto375: 'home-375.png', nameHe: 'עמוד הבית' },
  { id: 'domain-customers', path: '/solutions/customers/', protoScreen: 'domain-customers.html', proto1440: 'domain-customers-1440.png', proto375: 'domain-customers-375.png', nameHe: 'תחום שירות ומכירות' },
  { id: 'domain-operations', path: '/solutions/operations/', protoScreen: null, nameHe: 'תחום תפעול ומסמכים' },
  { id: 'domain-knowledge-and-teams', path: '/solutions/knowledge-and-teams/', protoScreen: null, nameHe: 'תחום ידע וצוותים' },
  { id: 'scenario-s1', path: '/scenarios/whatsapp-service-actions/', protoScreen: null, nameHe: 'תרחיש שירות ופעולות ב-WhatsApp' },
  { id: 'scenario-s2', path: '/scenarios/agent-assist-onboarding/', protoScreen: null, nameHe: 'תרחיש סיוע לנציגים והכשרה' },
  { id: 'scenario-s3', path: '/scenarios/documents-across-systems/', protoScreen: null, nameHe: 'תרחיש מסמכים ותהליכים בין מערכות' },
  { id: 'scenario-s4', path: '/scenarios/knowledge-chat-actions/', protoScreen: null, nameHe: 'תרחיש צ׳אט ידע ופעולות לעובדים' },
  { id: 'scenario-s5', path: '/scenarios/recording-to-outputs/', protoScreen: 'scenario-s5.html', proto1440: 'scenario-s5-1440.png', proto375: 'scenario-s5-375.png', nameHe: 'תרחיש תוצרי AI מהקלטת שיחה או פגישה' },
  { id: 'how-we-work', path: '/how-we-work/', protoScreen: 'how-we-work.html', proto1440: 'how-we-work-1440.png', proto375: 'how-we-work-375.png', nameHe: 'עמוד איך עובדים ומי אנחנו' },
  { id: 'contact', path: '/contact/', protoScreen: 'contact.html', proto1440: 'contact-regular-1440.png', proto375: 'contact-regular-375.png', nameHe: 'עמוד פנייה' },
  { id: 'privacy', path: '/privacy/', protoScreen: null, nameHe: 'מדיניות פרטיות' },
  { id: 'accessibility', path: '/accessibility/', protoScreen: null, nameHe: 'הצהרת נגישות' },
  { id: 'home-en', path: '/en/', protoScreen: 'home-en.html', proto1440: 'home-en-1440.png', proto375: 'home-en-375.png', nameHe: 'Home (English)' },
  { id: 'how-we-work-en', path: '/en/how-we-work/', protoScreen: null, nameHe: 'How we work (English)' },
  { id: 'contact-en', path: '/en/contact/', protoScreen: null, nameHe: 'Contact (English)' },
  { id: 'privacy-en', path: '/en/privacy/', protoScreen: null, nameHe: 'Privacy Policy (English)' },
  { id: 'accessibility-en', path: '/en/accessibility/', protoScreen: null, nameHe: 'Accessibility Statement (English)' },
  { id: '404', path: '/404.html', protoScreen: null, nameHe: 'דף 404' }
];

// Helper: extract visible text from HTML string
function extractVisibleText(html) {
  let text = html.replace(/<head[\s\S]*?<\/head>/gi, '')
                 .replace(/<script[\s\S]*?<\/script>/gi, '')
                 .replace(/<style[\s\S]*?<\/style>/gi, '')
                 .replace(/<svg[\s\S]*?<\/svg>/gi, '')
                 .replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'");
  return text.split(/\s+/).filter(Boolean);
}

// 1. Validate SEO & Meta
function validateSeoAndMetadata() {
  console.log('\n=== 1. VALIDATION: SEO & METADATA ===');
  const results = [];
  const seenTitles = new Map();
  const seenDescs = new Map();

  for (const p of pagesToTest) {
    let filePath = path.join(siteDir, p.path.endsWith('/') ? p.path + 'index.html' : p.path);
    if (!fs.existsSync(filePath)) continue;
    const html = fs.readFileSync(filePath, 'utf8');

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const descMatch = html.match(/<meta\s+name=["']description["']\s+content="([^"]*)"/i) ||
                      html.match(/<meta\s+name=["']description["']\s+content='([^']*)'/i);
    const desc = descMatch ? descMatch[1].trim() : '';

    const canMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    const canonical = canMatch ? canMatch[1].trim() : '';

    const ogTitle = (html.match(/<meta\s+property=["']og:title["']\s+content="([^"]*)"/i) || [])[1];
    const ogDesc = (html.match(/<meta\s+property=["']og:description["']\s+content="([^"]*)"/i) ||
                    html.match(/<meta\s+property=["']og:description["']\s+content='([^']*)'/i) || [])[1];
    const ogImage = (html.match(/<meta\s+property=["']og:image["']\s+content="([^"]*)"/i) || [])[1];
    const ogLocale = (html.match(/<meta\s+property=["']og:locale["']\s+content="([^"]*)"/i) || [])[1];

    const twCard = (html.match(/<meta\s+name=["']twitter:card["']\s+content="([^"]*)"/i) || [])[1];

    const hreflangs = [];
    const hlRegex = /<link\s+rel=["']alternate["']\s+hreflang=["']([^"']+)["']\s+href=["']([^"']+)["']/gi;
    let m;
    while ((m = hlRegex.exec(html)) !== null) {
      hreflangs.push({ lang: m[1], href: m[2] });
    }

    const jsonLdMatch = html.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i);
    let jsonLdParsed = null;
    let jsonLdType = null;
    if (jsonLdMatch) {
      try {
        jsonLdParsed = JSON.parse(jsonLdMatch[1]);
        jsonLdType = jsonLdParsed['@type'];
      } catch (err) {
        jsonLdType = 'PARSE_ERROR: ' + err.message;
      }
    }

    // Check title uniqueness
    if (seenTitles.has(title)) {
      console.warn(`[WARN] Duplicate title between ${p.id} and ${seenTitles.get(title)}: "${title}"`);
    } else {
      seenTitles.set(title, p.id);
    }

    // Check desc uniqueness (except 404)
    if (seenDescs.has(desc) && desc && p.id !== '404') {
      console.warn(`[WARN] Duplicate desc between ${p.id} and ${seenDescs.get(desc)}: "${desc}"`);
    } else if (desc) {
      seenDescs.set(desc, p.id);
    }

    const titleValid = title.includes('PowOrg');
    const descValid = desc.length > 10;
    const canValid = canonical.startsWith('https://poworg.com');
    const ogValid = !!(ogTitle && ogDesc && ogImage && ogLocale);
    const twValid = twCard === 'summary_large_image';
    const jsonLdValid = (p.id === 'home' || p.id === 'home-en') ? (jsonLdType === 'Organization') : (jsonLdMatch === null);

    const isPass = titleValid && descValid && canValid && ogValid && twValid && jsonLdValid;

    results.push({
      id: p.id,
      title,
      desc,
      canonical,
      ogTitle,
      ogDesc,
      ogImage,
      ogLocale,
      hreflangsCount: hreflangs.length,
      jsonLdType,
      isPass
    });

    console.log(`[${isPass ? 'PASS' : 'FAIL'}] ${p.id}: Title="${title}" | Canonical=${canonical} | Hreflang=${hreflangs.length} | JSON-LD=${jsonLdType || 'none'}`);
  }

  return results;
}

// 2. Forbidden Words & Syntax Audit
function checkForbiddenWords() {
  console.log('\n=== 2. VALIDATION: FORBIDDEN WORDS & SYNTAX ===');
  const forbiddenRules = [
    { name: 'Gershayim (״)', regex: /״/g },
    { name: 'Straight quote in Hebrew text (")', regex: /[\u0590-\u05FF][^\n]*"[^\n]*[\u0590-\u05FF]/g },
    { name: 'Em-dash (—)', regex: /—/g },
    { name: 'Exclamation mark (!)', regex: /!/g },
    { name: 'Forbidden phrase "לא רק"', regex: /לא רק/g },
    { name: 'Forbidden word "חינם"', regex: /חינם/g },
    { name: 'Forbidden currency ₪', regex: /₪/g },
    { name: 'Forbidden currency $', regex: /\$/g },
    { name: 'Forbidden term "SOC"', regex: /\bSOC\b/gi },
    { name: 'Forbidden term "GDPR"', regex: /\bGDPR\b/gi },
    { name: 'Forbidden timing "תוך יום"', regex: /תוך יום/g },
    { name: 'Forbidden timing "שבועות"', regex: /שבועות/g },
    { name: 'Forbidden phrase "לא מוכרים"', regex: /לא מוכרים/g },
    { name: 'Character name פופי / Poppy', regex: /\bPoppy\b|פופי/gi },
    { name: 'Character name דייב / Dave', regex: /\bDave\b|דייב/gi },
    { name: 'Internal code (S1-S5)', regex: /\bS[1-5]\b/g }
  ];

  const htmlFiles = [];
  function collectHtml(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) collectHtml(full);
      else if (f.endsWith('.html')) htmlFiles.push(full);
    }
  }
  collectHtml(siteDir);

  const findings = [];

  for (const f of htmlFiles) {
    const rel = path.relative(siteDir, f);
    const html = fs.readFileSync(f, 'utf8');

    // A. Check Meta Title and Description
    const title = (html.match(/<title>([^<]+)<\/title>/i) || [])[1] || '';
    const desc = (html.match(/<meta\s+name=["']description["']\s+content="([^"]*)"/i) || [])[1] || '';

    for (const rule of forbiddenRules) {
      rule.regex.lastIndex = 0;
      if (rule.regex.test(title)) {
        findings.push({ file: rel, context: 'title', rule: rule.name, text: title, isTodoCopy: false });
      }
      rule.regex.lastIndex = 0;
      if (rule.regex.test(desc)) {
        findings.push({ file: rel, context: 'meta-description', rule: rule.name, text: desc, isTodoCopy: false });
      }
    }

    // Parentheses in Hebrew title or description
    if (html.includes('lang="he"')) {
      if (title.includes('(') || title.includes(')')) {
        findings.push({ file: rel, context: 'title', rule: 'Parentheses in Hebrew title', text: title, isTodoCopy: false });
      }
      if (desc.includes('(') || desc.includes(')')) {
        findings.push({ file: rel, context: 'meta-description', rule: 'Parentheses in Hebrew description', text: desc, isTodoCopy: false });
      }
    }

    // B. Check Body content: extract clean text outside tags, scripts, styles, comments
    let body = html.replace(/<head[\s\S]*?<\/head>/gi, '')
                   .replace(/<script[\s\S]*?<\/script>/gi, '')
                   .replace(/<style[\s\S]*?<\/style>/gi, '')
                   .replace(/<svg[\s\S]*?<\/svg>/gi, '')
                   .replace(/<!--[\s\S]*?-->/g, '');

    // Extract TODO-COPY elements
    const todoMatches = body.match(/<[a-z0-9]+[^>]*class=["'][^"']*todo-copy[^"']*["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/gi) || [];
    for (const tm of todoMatches) {
      const cleanTm = tm.replace(/<[^>]+>/g, '').trim();
      for (const rule of forbiddenRules) {
        rule.regex.lastIndex = 0;
        if (rule.regex.test(cleanTm)) {
          findings.push({ file: rel, context: 'TODO-COPY', rule: rule.name, text: cleanTm, isTodoCopy: true });
        }
      }
    }

    // Remove TODO-COPY blocks for pure visible text check
    const visibleBody = body.replace(/<[a-z0-9]+[^>]*class=["'][^"']*todo-copy[^"']*["'][^>]*>[\s\S]*?<\/[a-z0-9]+>/gi, ' ');
    // Strip all HTML tags
    const visibleText = visibleBody.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

    const lines = visibleText.split('\n').map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
      for (const rule of forbiddenRules) {
        rule.regex.lastIndex = 0;
        let m;
        while ((m = rule.regex.exec(line)) !== null) {
          findings.push({
            file: rel,
            context: 'visible-body',
            rule: rule.name,
            text: line.substring(Math.max(0, m.index - 20), Math.min(line.length, m.index + 40)),
            isTodoCopy: false
          });
        }
      }

      // Check parentheses in Hebrew visible body
      if (html.includes('lang="he"')) {
        if (/[\u0590-\u05FF]/.test(line) && (line.includes('(') || line.includes(')'))) {
          findings.push({
            file: rel,
            context: 'visible-body',
            rule: 'Parentheses in visible Hebrew text',
            text: line.substring(0, 80),
            isTodoCopy: false
          });
        }
      }
    }

    // Check founder line technology names (§5.7)
    const founderCardMatch = html.match(/class=["'][^"']*founder-card[^"']*["'][\s\S]*?<\/div>/i) ||
                             html.match(/id=["']about["'][\s\S]*?<\/section>/i);
    if (founderCardMatch) {
      const techNames = [/\bPython\b/i, /\bReact\b/i, /\bNode\b/i, /\bAWS\b/i, /\bAzure\b/i, /\bClaude\b/i, /\bOpenAI\b/i, /\bGemini\b/i, /\bLLM\b/i, /\bPostgres\b/i];
      for (const tn of techNames) {
        if (tn.test(founderCardMatch[0])) {
          // Check if inside the founder bio sentence specifically
          const bioLineMatch = founderCardMatch[0].match(/ניסיון בפיתוח[^\n<]*/);
          if (bioLineMatch && tn.test(bioLineMatch[0])) {
            findings.push({ file: rel, context: 'founder-bio', rule: 'Technology names in founder line (§5.7)', text: bioLineMatch[0], isTodoCopy: false });
          }
        }
      }
    }
  }

  const visibleViolations = findings.filter(f => !f.isTodoCopy);
  const todoCopyFindings = findings.filter(f => f.isTodoCopy);

  console.log(`Total findings: ${findings.length}`);
  console.log(`Visible text / meta violations: ${visibleViolations.length}`);
  console.log(`TODO-COPY matches recorded for report: ${todoCopyFindings.length}`);

  if (visibleViolations.length > 0) {
    visibleViolations.forEach(v => console.error(`  [VIOLATION] ${v.file} (${v.context}) [${v.rule}]: "${v.text}"`));
  } else {
    console.log('[PASS] No forbidden words, quotes, gershayim, or parentheses in visible text or metadata!');
  }

  return { findings, visibleViolations, todoCopyFindings };
}

// 3. Contact Links Audit (from & intent)
function validateContactLinks() {
  console.log('\n=== 3. VALIDATION: CONTACT BUTTONS FROM & INTENT ===');
  const results = [];
  const htmlFiles = [];
  function collectHtml(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) collectHtml(full);
      else if (f.endsWith('.html')) htmlFiles.push(full);
    }
  }
  collectHtml(siteDir);

  for (const f of htmlFiles) {
    const rel = path.relative(siteDir, f);
    const content = fs.readFileSync(f, 'utf8');

    const linkRegex = /<a\s+[^>]*href=["']([^"']*(?:contact)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = linkRegex.exec(content)) !== null) {
      const href = m[1];
      const text = m[2].replace(/<[^>]+>/g, '').trim();

      results.push({
        file: rel,
        href,
        text,
        hasFrom: href.includes('from='),
        hasIntent: href.includes('intent=')
      });
    }
  }

  console.log(`Audited ${results.length} contact links across site.`);
  return results;
}

// 4. English Links Check
function validateEnglishLinks() {
  console.log('\n=== 4. VALIDATION: ENGLISH PAGE LINKS (CRITERION 8) ===');
  const enDir = path.join(siteDir, 'en');
  const violations = [];

  function scanEn(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) scanEn(full);
      else if (f.endsWith('.html')) {
        const content = fs.readFileSync(full, 'utf8');
        const rel = path.relative(siteDir, full);
        
        const aRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
        let m;
        while ((m = aRegex.exec(content)) !== null) {
          const href = m[1];
          if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) continue;
          if (m[0].includes('class="translations-switch') || m[0].includes('class="lang-switch')) continue;

          if (href.startsWith('/solutions/') || href.startsWith('/scenarios/') || (href.startsWith('/how-we-work/') && !href.startsWith('/en/')) || (href.startsWith('/contact/') && !href.startsWith('/en/'))) {
            violations.push({
              file: rel,
              linkTag: m[0],
              href
            });
          }
        }
      }
    }
  }

  scanEn(enDir);
  console.log(`English pages linking to Hebrew URLs: ${violations.length}`);
  if (violations.length > 0) {
    violations.forEach(v => console.error(`  [VIOLATION] ${v.file}: ${v.href}`));
  } else {
    console.log('[PASS] No English page links to Hebrew URLs (except language switcher).');
  }

  return violations;
}

// 5. Text Diff vs Prototype
function compareTextWithPrototypes() {
  console.log('\n=== 5. VALIDATION: TEXT COMPARISON AGAINST PROTOTYPES ===');
  const diffs = [];

  for (const p of pagesToTest) {
    if (!p.protoScreen) continue;
    const protoPath = path.join(prototypeScreensDir, p.protoScreen);
    const sitePath = path.join(siteDir, p.path.endsWith('/') ? p.path + 'index.html' : p.path);

    if (!fs.existsSync(protoPath) || !fs.existsSync(sitePath)) {
      continue;
    }

    const protoText = extractVisibleText(fs.readFileSync(protoPath, 'utf8'));
    const siteText = extractVisibleText(fs.readFileSync(sitePath, 'utf8'));

    const protoSet = new Set(protoText);
    const siteSet = new Set(siteText);

    const inProtoNotSite = [...protoSet].filter(w => !siteSet.has(w));
    const inSiteNotProto = [...siteSet].filter(w => !protoSet.has(w));

    diffs.push({
      pageId: p.id,
      nameHe: p.nameHe,
      protoFile: p.protoScreen,
      protoWordsCount: protoText.length,
      siteWordsCount: siteText.length,
      inProtoNotSite,
      inSiteNotProto
    });

    console.log(`Page ${p.id} (${p.nameHe}): Proto words: ${protoText.length}, Site words: ${siteText.length}`);
  }

  return diffs;
}

// 6. Full Puppeteer Suite
async function runPuppeteerSuite() {
  console.log('\n=== 6. LAUNCHING PUPPETEER FOR VISUAL VALIDATION & SCREENSHOTS ===');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--font-render-hinting=medium']
  });

  const page = await browser.newPage();

  // Above-the-fold CTA at 360x640 (Criterion 6)
  console.log('\n=== 6a. VALIDATION: ABOVE-THE-FOLD CTA AT 360x640 ===');
  const ctaPages = [
    { id: 'home', path: '/' },
    { id: 'scenario-s1', path: '/scenarios/whatsapp-service-actions/' },
    { id: 'scenario-s2', path: '/scenarios/agent-assist-onboarding/' },
    { id: 'scenario-s3', path: '/scenarios/documents-across-systems/' },
    { id: 'scenario-s4', path: '/scenarios/knowledge-chat-actions/' },
    { id: 'scenario-s5', path: '/scenarios/recording-to-outputs/' }
  ];

  const ctaResults = [];
  await page.setViewport({ width: 360, height: 640, deviceScaleFactor: 1 });

  for (const cp of ctaPages) {
    await page.goto(`${baseUrl}${cp.path}`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 400));

    const ctaMetrics = await page.evaluate(() => {
      const btn = document.querySelector('.hero-actions .btn-primary, .scenario-hero-actions .btn, .hero .btn-primary');
      if (!btn) return { found: false };
      const rect = btn.getBoundingClientRect();
      const style = window.getComputedStyle(btn);
      const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      return {
        found: true,
        text: btn.innerText.trim(),
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        isVisible,
        aboveFold: rect.top >= 0 && rect.bottom <= 640
      };
    });

    const isPass = ctaMetrics.found && ctaMetrics.aboveFold;
    console.log(`[${isPass ? 'PASS' : 'FAIL'}] ${cp.id}: Found=${ctaMetrics.found}, Top=${ctaMetrics.top}px, Bottom=${ctaMetrics.bottom}px, AboveFold=${ctaMetrics.aboveFold}`);
    ctaResults.push({ id: cp.id, ...ctaMetrics, isPass });
  }

  // Capturing 1440px and 375px screenshots for all 19 pages
  console.log('\n=== 6b. CAPTURING ALL PAGES AT 1440px AND 375px ===');
  const captureWidths = [1440, 375];

  for (const p of pagesToTest) {
    const url = `${baseUrl}${p.path}`;
    for (const w of captureWidths) {
      const h = w === 1440 ? 900 : 812;
      await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      await new Promise(r => setTimeout(r, 400));

      const filename = `${p.id}-${w}.png`;
      const outPath = path.join(outShotsDir, filename);
      await page.screenshot({ path: outPath, fullPage: true });
      const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
      console.log(`  Saved ${filename} (${w}px, ${sizeKb} KB)`);
    }
  }

  // Capturing Side-by-Side Comparison Screenshots for Approved Screens
  console.log('\n=== 6c. CAPTURING SIDE-BY-SIDE COMPARISONS FOR APPROVED SCREENS ===');
  const comparePairs = pagesToTest.filter(p => p.protoScreen && p.proto1440 && p.proto375);

  for (const pair of comparePairs) {
    for (const w of [1440, 375]) {
      const branchShotName = `${pair.id}-${w}.png`;
      const branchShotPath = path.join(outShotsDir, branchShotName);
      const protoShotName = w === 1440 ? pair.proto1440 : pair.proto375;
      const protoShotPath = path.join(prototypeShotsDir, protoShotName);

      if (fs.existsSync(branchShotPath) && fs.existsSync(protoShotPath)) {
        const branchBase64 = fs.readFileSync(branchShotPath).toString('base64');
        const protoBase64 = fs.readFileSync(protoShotPath).toString('base64');

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
    <h1>השוואת WP3 מול מסך D1 מאושר — ${pair.nameHe} (${w}px)</h1>
    <p>ימין: ענף site-v2 לאחר יישום WP3 | שמאל: מסך D1 מאושר (screens-prototype, d52eb70)</p>
  </div>
  <div class="grid">
    <div class="col">
      <div class="col-title">ענף site-v2 (מימוש WP3)</div>
      <img src="data:image/png;base64,${branchBase64}">
    </div>
    <div class="col">
      <div class="col-title">מסך D1 מאושר (${pair.protoScreen})</div>
      <img src="data:image/png;base64,${protoBase64}">
    </div>
  </div>
</body>
</html>`;

        const compareWidth = w === 1440 ? 3000 : 900;
        await page.setViewport({ width: compareWidth, height: 1200, deviceScaleFactor: 1 });
        await page.setContent(compareHtml, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        await new Promise(r => setTimeout(r, 400));

        const compOutName = `compare-${pair.id}-${w}.png`;
        const compOutPath = path.join(outShotsDir, compOutName);
        await page.screenshot({ path: compOutPath, fullPage: true });
        console.log(`  Generated side-by-side comparison: ${compOutName}`);
      }
    }
  }

  await browser.close();
  return { ctaResults };
}

// Main execution
async function main() {
  console.log('=== STARTING WP3 AUTOMATED VALIDATION & SCREENSHOT RUNNER ===\n');
  const server = await startServer();

  try {
    const seoResults = validateSeoAndMetadata();
    const forbidden = checkForbiddenWords();
    const contactLinks = validateContactLinks();
    const englishLinkViolations = validateEnglishLinks();
    const textDiffs = compareTextWithPrototypes();
    const puppeteerData = await runPuppeteerSuite();

    const summaryReport = {
      timestamp: new Date().toISOString(),
      seoResults,
      forbiddenFindingsCount: forbidden.findings.length,
      visibleViolationsCount: forbidden.visibleViolations.length,
      visibleViolations: forbidden.visibleViolations,
      todoCopyFindingsCount: forbidden.todoCopyFindings.length,
      todoCopyFindings: forbidden.todoCopyFindings,
      contactLinksCount: contactLinks.length,
      contactLinksWithFromCount: contactLinks.filter(c => c.hasFrom).length,
      englishLinkViolationsCount: englishLinkViolations.length,
      englishLinkViolations,
      textDiffs,
      ctaResults: puppeteerData.ctaResults
    };

    fs.writeFileSync(path.join(projectDir, '_dev', 'wp3_validation_results.json'), JSON.stringify(summaryReport, null, 2), 'utf8');
    console.log('\n=== ALL WP3 VALIDATIONS & SCREENSHOTS COMPLETED SUCCESSFULLY ===');
    console.log(`Summary report written to _dev/wp3_validation_results.json`);
  } finally {
    server.close();
  }
}

main().catch(err => {
  console.error('Runner failed:', err);
  process.exit(1);
});
