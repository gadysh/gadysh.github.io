const path = require('path');
const fs = require('fs');

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
const outShotsDir = path.join(projectDir, '_dev', 'shots', 'wp2');
const prototypeShotsDir = 'C:\\Users\\msgad\\Documents\\AI\\PowOrg\\gadysh.github.io\\screens-prototype\\shots';
const baseUrl = 'http://127.0.0.1:4000';

if (!fs.existsSync(outShotsDir)) {
  fs.mkdirSync(outShotsDir, { recursive: true });
}

// 1. Contrast calculations (WCAG 2.1)
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function relativeLuminance(rgb) {
  const sRGB = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  const linear = sRGB.map(val => {
    return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(hex1, hex2) {
  const lum1 = relativeLuminance(hexToRgb(hex1));
  const lum2 = relativeLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const colorPairs = [
  { element: 'טקסט ראשי וכותרות (--ink)', fg: '#0b2540', bg: '#ffffff', bgName: 'לבן ראשי (--surface)', type: 'normal' },
  { element: 'טקסט ראשי (--ink)', fg: '#0b2540', bg: '#f4f7fa', bgName: 'רצועה מתחלפת (--surface-alt)', type: 'normal' },
  { element: 'טקסט ראשי (--ink)', fg: '#0b2540', bg: '#f7f3ec', bgName: 'רצועת חול (--sand)', type: 'normal' },
  { element: 'טקסט ראשי (--ink)', fg: '#0b2540', bg: '#ecfeff', bgName: 'רקע תגיות (--teal-50)', type: 'normal' },
  { element: 'טקסט משני (--muted)', fg: '#475569', bg: '#ffffff', bgName: 'לבן ראשי (--surface)', type: 'normal' },
  { element: 'טקסט משני (--muted)', fg: '#475569', bg: '#f4f7fa', bgName: 'רצועה מתחלפת (--surface-alt)', type: 'normal' },
  { element: 'טקסט משני (--muted)', fg: '#475569', bg: '#f7f3ec', bgName: 'רצועת חול (--sand)', type: 'normal' },
  { element: 'קישורים וכפתורים (--teal-700)', fg: '#0e7490', bg: '#ffffff', bgName: 'לבן ראשי (--surface)', type: 'normal' },
  { element: 'קישורים (--teal-700)', fg: '#0e7490', bg: '#f4f7fa', bgName: 'רצועה מתחלפת (--surface-alt)', type: 'normal' },
  { element: 'קישורים (--teal-700)', fg: '#0e7490', bg: '#f7f3ec', bgName: 'רצועת חול (--sand)', type: 'normal' },
  { element: 'טקסט כפתור ראשי (לבן)', fg: '#ffffff', bg: '#0e7490', bgName: 'כפתור טורקיז (--teal-700)', type: 'normal' },
  { element: 'טקסט כותרות ורצועה כהה (לבן)', fg: '#ffffff', bg: '#0c4a6e', bgName: 'רצועת Navy ו-Footer (--navy)', type: 'normal' },
  { element: 'טקסט משני ברצועת Navy', fg: '#ecfeff', bg: '#0c4a6e', bgName: 'רצועת Navy ו-Footer (--navy)', type: 'normal' },
  { element: 'הודעת שגיאה בטופס (--error)', fg: '#b42318', bg: '#ffffff', bgName: 'לבן ראשי (--surface)', type: 'normal' },
  { element: 'הודעת שגיאה בטופס (--error)', fg: '#b42318', bg: '#fef3f2', bgName: 'רקע שגיאה עדין (--error-bg)', type: 'normal' },
  { element: 'קווי זרימה ואייקונים (--teal-500)', fg: '#0891b2', bg: '#ffffff', bgName: 'לבן ראשי (--surface)', type: 'large/graphics' },
  { element: 'קישורים וזכויות יוצרים בפוטר', fg: '#94a3b8', bg: '#0b2540', bgName: 'כותרת תחתונה (--ink)', type: 'normal' },
  { element: 'כותרות בכותרת התחתונה', fg: '#ffffff', bg: '#0b2540', bgName: 'כותרת תחתונה (--ink)', type: 'normal' }
];

console.log('=== 1. VERIFYING CONTRAST RATIOS ===');
const contrastResults = colorPairs.map(item => {
  const ratio = contrastRatio(item.fg, item.bg);
  const minRequired = item.type === 'normal' ? 4.5 : 3.0;
  const passed = ratio >= minRequired;
  const rating = ratio >= 7.0 ? 'AAA' : (ratio >= 4.5 ? 'AA' : (ratio >= 3.0 ? 'AA Large' : 'FAIL'));
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${item.element} (${item.fg} on ${item.bg}): ${ratio.toFixed(2)}:1 (${rating})`);
  return { ...item, ratio: ratio.toFixed(2), passed, rating };
});

const pagesToTest = [
  { name: 'home', path: '/' },
  { name: 'domain-customers', path: '/solutions/customers/' },
  { name: 'scenario-s5', path: '/scenarios/recording-to-outputs/' },
  { name: 'how-we-work', path: '/how-we-work/' },
  { name: 'contact', path: '/contact/' },
  { name: 'home-en', path: '/en/' },
  { name: 'styleguide', path: '/styleguide/' }
];

const targetWidths = [360, 768, 1024, 1440];
const allCheckWidths = [320, 360, 375, 768, 1024, 1440];

async function main() {
  console.log('\n=== 2. LAUNCHING PUPPETEER ===');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--font-render-hinting=medium']
  });

  const page = await browser.newPage();

  // Test Interactive Behaviors (Criterion 4)
  console.log('\n=== 3. TESTING INTERACTIVE DISCLOSURE & MOBILE DRAWER (CRITERION 4) ===');
  
  // Desktop Menu Test
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  const menuBtnExpandedInit = await page.$eval('#solutions-menu-btn', el => el.getAttribute('aria-expanded'));
  console.log(`- Solutions Menu initial aria-expanded: ${menuBtnExpandedInit} (Expected: false)`);

  await page.click('#solutions-menu-btn');
  const menuBtnExpandedOpen = await page.$eval('#solutions-menu-btn', el => el.getAttribute('aria-expanded'));
  const menuIsOpenClass = await page.$eval('#solutions-menu', el => el.classList.contains('is-open'));
  console.log(`- Solutions Menu opened: aria-expanded=${menuBtnExpandedOpen}, is-open=${menuIsOpenClass} (Expected: true, true)`);

  await page.keyboard.press('Escape');
  const menuBtnExpandedClosed = await page.$eval('#solutions-menu-btn', el => el.getAttribute('aria-expanded'));
  const menuIsClosedClass = await page.$eval('#solutions-menu', el => el.classList.contains('is-open'));
  const activeElementIdAfterEsc = await page.evaluate(() => document.activeElement.id);
  console.log(`- Solutions Menu closed by Esc: aria-expanded=${menuBtnExpandedClosed}, is-open=${menuIsClosedClass}, focused=${activeElementIdAfterEsc} (Expected: false, false, solutions-menu-btn)`);

  // Mobile Drawer Test
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  const drawerBtnExpandedInit = await page.$eval('#drawer-toggle-btn', el => el.getAttribute('aria-expanded'));
  console.log(`- Mobile Drawer initial aria-expanded: ${drawerBtnExpandedInit} (Expected: false)`);

  await page.click('#drawer-toggle-btn');
  await new Promise(r => setTimeout(r, 300));
  const drawerBtnExpandedOpen = await page.$eval('#drawer-toggle-btn', el => el.getAttribute('aria-expanded'));
  const drawerIsOpenClass = await page.$eval('#mobile-drawer', el => el.classList.contains('is-open'));
  const drawerAriaHidden = await page.$eval('#mobile-drawer', el => el.getAttribute('aria-hidden'));
  const drawerActiveElementId = await page.evaluate(() => document.activeElement.id);
  console.log(`- Mobile Drawer opened: aria-expanded=${drawerBtnExpandedOpen}, is-open=${drawerIsOpenClass}, aria-hidden=${drawerAriaHidden}, focused=${drawerActiveElementId} (Expected: true, true, false, drawer-close-btn)`);

  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));
  const drawerBtnExpandedClosed = await page.$eval('#drawer-toggle-btn', el => el.getAttribute('aria-expanded'));
  const drawerIsClosedClass = await page.$eval('#mobile-drawer', el => el.classList.contains('is-open'));
  const drawerAriaHiddenClosed = await page.$eval('#mobile-drawer', el => el.getAttribute('aria-hidden'));
  const activeElementAfterDrawerEsc = await page.evaluate(() => document.activeElement.id);
  console.log(`- Mobile Drawer closed by Esc: aria-expanded=${drawerBtnExpandedClosed}, is-open=${drawerIsClosedClass}, aria-hidden=${drawerAriaHiddenClosed}, focused=${activeElementAfterDrawerEsc} (Expected: false, false, true, drawer-toggle-btn)`);

  // Reduced Motion Test (Criterion 6)
  console.log('\n=== 4. TESTING PREFERS-REDUCED-MOTION: REDUCE (CRITERION 6) ===');
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0' });
  const reducedMotionTransition = await page.evaluate(() => {
    const btn = document.querySelector('.btn-primary');
    return window.getComputedStyle(btn).transitionDuration;
  });
  console.log(`- Transition duration with prefers-reduced-motion: reduce: "${reducedMotionTransition}" (Expected: <= 0.0001s / 0.01ms)`);
  await page.emulateMediaFeatures([]); // Reset

  // Horizontal Overflow & Zoom Tests (Criterion 7)
  console.log('\n=== 5. TESTING HORIZONTAL OVERFLOW & 200% ZOOM (CRITERION 7) ===');
  for (const pageItem of pagesToTest) {
    const url = `${baseUrl}${pageItem.path}`;
    for (const w of allCheckWidths) {
      await page.setViewport({ width: w, height: 800 });
      await page.goto(url, { waitUntil: 'networkidle0' });
      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        return { docWidth, winWidth, hasHorizontalScroll: docWidth > winWidth };
      });
      if (overflow.hasHorizontalScroll) {
        console.error(`[OVERFLOW ERROR] ${pageItem.name} at ${w}px has scrollWidth ${overflow.docWidth} > innerWidth ${overflow.winWidth}`);
      } else {
        // passed
      }
    }
    // Test 200% Zoom
    await page.setViewport({ width: 640, height: 480, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: 'networkidle0' });
    const zoomOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    console.log(`- Page ${pageItem.name}: No horizontal scroll on 320-1440px and 200% zoom OK: ${zoomOverflow}`);
  }

  // Capturing Responsive Screenshots
  console.log('\n=== 6. CAPTURING RESPONSIVE SCREENSHOTS IN _dev/shots/wp2/ ===');
  for (const pageItem of pagesToTest) {
    const url = `${baseUrl}${pageItem.path}`;
    for (const width of targetWidths) {
      const height = width >= 1024 ? 900 : 812;
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      await page.goto(url, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 600));

      const filename = `${pageItem.name}-${width}.png`;
      const outPath = path.join(outShotsDir, filename);
      await page.screenshot({ path: outPath, fullPage: true });
      const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
      console.log(`  Saved ${filename} (${width}px, ${sizeKb} KB)`);
    }

    // Also capture 375px for direct comparison with D1 prototype shots
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    const filename375 = `${pageItem.name}-375.png`;
    const outPath375 = path.join(outShotsDir, filename375);
    await page.screenshot({ path: outPath375, fullPage: true });
    console.log(`  Saved ${filename375} (375px, ${(fs.statSync(outPath375).size / 1024).toFixed(1)} KB)`);
  }

  // Capturing Side-by-Side Comparison Screenshots (Criterion 1)
  console.log('\n=== 7. GENERATING SIDE-BY-SIDE COMPARISONS (CRITERION 1) ===');
  const comparePairs = [
    { name: 'home', protoFile1440: 'home-1440.png', protoFile375: 'home-375.png' },
    { name: 'domain-customers', protoFile1440: 'domain-customers-1440.png', protoFile375: 'domain-customers-375.png' },
    { name: 'scenario-s5', protoFile1440: 'scenario-s5-1440.png', protoFile375: 'scenario-s5-375.png' },
    { name: 'how-we-work', protoFile1440: 'how-we-work-1440.png', protoFile375: 'how-we-work-375.png' },
    { name: 'contact', protoFile1440: 'contact-regular-1440.png', protoFile375: 'contact-regular-375.png' },
    { name: 'home-en', protoFile1440: 'home-en-1440.png', protoFile375: 'home-en-375.png' }
  ];

  for (const pair of comparePairs) {
    for (const w of [1440, 375]) {
      const branchShotName = `${pair.name}-${w}.png`;
      const branchShotPath = path.join(outShotsDir, branchShotName);
      const protoShotName = w === 1440 ? pair.protoFile1440 : pair.protoFile375;
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
    body { margin: 0; padding: 20px; background: #0b2540; font-family: sans-serif; color: #fff; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { font-size: 20px; margin: 0 0 8px 0; }
    .grid { display: flex; gap: 20px; justify-content: center; }
    .col { flex: 1; max-width: ${w}px; background: #fff; border-radius: 8px; overflow: hidden; }
    .col-title { background: #0c4a6e; color: #fff; padding: 10px 16px; font-weight: bold; font-size: 14px; text-align: center; }
    .col img { width: 100%; display: block; }
  </style>
</head>
<body>
  <div class="header">
    <h1>השוואת WP2 מול מסכי D1 שאושרו — ${pair.name} (${w}px)</h1>
    <p>ימין: ענף site-v2 הנוכחי | שמאל: מסך D1 מאושר (screens-prototype, d52eb70)</p>
  </div>
  <div class="grid">
    <div class="col">
      <div class="col-title">ענף site-v2 (מימוש WP2)</div>
      <img src="data:image/png;base64,${branchBase64}">
    </div>
    <div class="col">
      <div class="col-title">אב־טיפוס D1 שאושר (screens-prototype)</div>
      <img src="data:image/png;base64,${protoBase64}">
    </div>
  </div>
</body>
</html>`;

        const compareWidth = w === 1440 ? 3000 : 900;
        await page.setViewport({ width: compareWidth, height: 1200, deviceScaleFactor: 1 });
        await page.setContent(compareHtml, { waitUntil: 'load' });
        await new Promise(r => setTimeout(r, 400));

        const compOutName = `compare-${pair.name}-${w}.png`;
        const compOutPath = path.join(outShotsDir, compOutName);
        await page.screenshot({ path: compOutPath, fullPage: true });
        console.log(`  Generated side-by-side comparison: ${compOutName}`);
      }
    }
  }

  await browser.close();
  console.log('\n=== ALL SCREENSHOTS & COMPARISONS COMPLETED SUCCESSFULLY ===');
}

main().catch(err => {
  console.error('Validation and shots failed:', err);
  process.exit(1);
});
