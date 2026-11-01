const path = require('path');
const fs = require('fs');

let puppeteer;
try {
  puppeteer = require('puppeteer-core');
} catch (e) {
  const tempPuppeteer = path.join(process.env.TEMP, 'node_modules', 'puppeteer-core');
  puppeteer = require(tempPuppeteer);
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const projectDir = path.resolve(__dirname, '..');
const imgDir = path.join(projectDir, 'assets', 'img');

if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// Convert logo symbol to base64 so it renders reliably in Puppeteer file/HTML
const logoPath = path.join(projectDir, 'assets', 'logo-symbol.png');
const logoBase64 = fs.readFileSync(logoPath).toString('base64');
const logoDataUri = `data:image/png;base64,${logoBase64}`;

const ogConfigs = [
  {
    filename: 'og-image.png',
    lang: 'he',
    dir: 'rtl',
    font: 'Heebo',
    title: 'פתרונות AI שעובדים בתוך התהליכים והמערכות של הארגון'
  },
  {
    filename: 'og-image-en.png',
    lang: 'en',
    dir: 'ltr',
    font: 'Inter',
    title: "AI solutions that work inside your organization's processes and systems"
  }
];

function buildHtml(config) {
  return `<!DOCTYPE html>
<html lang="${config.lang}" dir="${config.dir}">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@500;700&family=Inter:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      background-color: #f4f7fa;
      font-family: '${config.font}', system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 80px 96px;
      position: relative;
    }
    .accent-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, #0e7490, #0891b2, #0c4a6e);
    }
    .brand-header {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .brand-logo {
      width: 64px;
      height: 64px;
      object-fit: contain;
    }
    .brand-name {
      font-size: 38px;
      font-weight: 700;
      color: #0b2540;
      letter-spacing: -0.5px;
    }
    .hero-title-wrap {
      max-width: 1000px;
    }
    .hero-title {
      font-size: 56px;
      line-height: 1.25;
      font-weight: 700;
      color: #0b2540;
      letter-spacing: -0.5px;
    }
    .footer-watermark {
      font-size: 24px;
      font-weight: 500;
      color: #0e7490;
    }
  </style>
</head>
<body>
  <div class="accent-bar"></div>
  <div class="brand-header">
    <img src="${logoDataUri}" alt="PowOrg logo" class="brand-logo">
    <span class="brand-name">PowOrg</span>
  </div>
  <div class="hero-title-wrap">
    <h1 class="hero-title">${config.title}</h1>
  </div>
  <div class="footer-watermark">
    poworg.com
  </div>
</body>
</html>`;
}

async function generate() {
  console.log('Launching browser to render OG images...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  for (const cfg of ogConfigs) {
    const html = buildHtml(cfg);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 500));

    const outPath = path.join(imgDir, cfg.filename);
    await page.screenshot({
      path: outPath,
      type: 'png'
    });

    const stat = fs.statSync(outPath);
    console.log(`Generated ${cfg.filename}: ${(stat.size / 1024).toFixed(1)} KB (Target: under 200KB)`);
  }

  await browser.close();
  console.log('OG images generated successfully.');
}

generate().catch(err => {
  console.error('Error generating OG images:', err);
  process.exit(1);
});
