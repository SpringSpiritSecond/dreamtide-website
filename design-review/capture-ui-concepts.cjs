// Captures each phone screen from the App design drafts as its own transparent-cornered PNG.
// Usage: node design-review/capture-ui-concepts.cjs <ui-concepts dir> <output dir>
// The drafts are read as-is; inline scripts are wrapped in a block so a global name that clashes
// with window (e.g. `const top`) does not stop a draft from rendering.
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const [, , srcDir, outDir] = process.argv;
const pages = [
  'dreamtide-home-switch', 'dreamtide-home-data', 'dreamtide-page-wordcloud', 'dreamtide-page-archive',
  'dreamtide-page-calendar', 'dreamtide-page-editor', 'dreamtide-page-account',
  'dreamtide-page-view', 'dreamtide-page-reading',
];

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 2 });
  page.on('pageerror', (error) => console.warn('page error:', error.message));
  await page.route('**/*.html', (route) => {
    const file = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\/([A-Za-z]:)/, '$1');
    const html = fs.readFileSync(file, 'utf8')
      .replace(/<script>([\s\S]*?)<\/script>/g, '<script>{$1}</script>')
      .replace('</head>', '<style>html,body{background:transparent!important}</style></head>');
    route.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
  });
  for (const name of pages) {
    await page.goto('file:///' + path.resolve(srcDir, name + '.html').replace(/\\/g, '/'));
    await page.waitForTimeout(1500);
    const phones = await page.locator('.phone').all();
    for (let i = 0; i < phones.length; i++) {
      const file = path.join(outDir, `${name}-${String(i + 1).padStart(2, '0')}.png`);
      await phones[i].screenshot({ path: file, animations: 'disabled', omitBackground: true });
    }
    console.log(name, phones.length);
  }
  await browser.close();
})();
