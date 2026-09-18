import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const shotsDir = 'C:/Users/matt8/AppData/Local/Temp/claude/C--Users-matt8-aesop/90b96afc-2018-46a9-b7b4-2935d5ac34e9/scratchpad/shots';
if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir, { recursive: true });

const URL = 'https://matt82198.github.io';
const VIEWPORTS = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 390, height: 844, name: 'mobile' }
];

async function capturePortfolio() {
  const browser = await chromium.launch();
  const results = {};

  for (const viewport of VIEWPORTS) {
    console.log(`\n=== Capturing ${viewport.name} (${viewport.width}x${viewport.height}) ===`);

    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    });

    const page = await context.newPage();
    const consoleErrors = [];
    const requests = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    page.on('response', response => {
      requests.push({
        url: response.url(),
        status: response.status()
      });
    });

    // Light mode
    console.log('Capturing light mode...');
    await page.goto(URL, { waitUntil: 'networkidle' });

    const lightTiming = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perf?.domContentLoadedEventEnd - perf?.domContentLoadedEventStart,
        loadTime: perf?.loadEventEnd - perf?.loadEventStart
      };
    });

    const lightBytes = await page.evaluate(() => {
      return performance.getEntriesByType('resource').reduce((sum, r) =>
        sum + (r.transferSize || 0), 0) + (performance.getEntriesByType('navigation')[0]?.transferSize || 0);
    });

    const lightFile = path.join(shotsDir, `${viewport.name}-light.png`);
    await page.screenshot({ path: lightFile, fullPage: true });
    console.log(`Saved: ${lightFile}`);

    // Dark mode
    console.log('Capturing dark mode...');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(500);

    const darkFile = path.join(shotsDir, `${viewport.name}-dark.png`);
    await page.screenshot({ path: darkFile, fullPage: true });
    console.log(`Saved: ${darkFile}`);

    // Capture page text
    const pageText = await page.evaluate(() => document.body.innerText);
    const textFile = path.join(shotsDir, `${viewport.name}-text.txt`);
    fs.writeFileSync(textFile, pageText);
    console.log(`Saved text: ${textFile}`);

    results[viewport.name] = {
      timing: lightTiming,
      bytesTransferred: lightBytes,
      consoleErrors,
      requests: requests.filter(r => r.status >= 400)
    };

    await context.close();
  }

  // Check links
  console.log('\n=== Checking links ===');
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(URL);

  const links = await page.locator('a[href]').all();
  const linkResults = [];

  for (const link of links) {
    const href = await link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) continue;

    try {
      const response = await page.request.head(href, { timeout: 5000 }).catch(() =>
        page.request.get(href, { timeout: 5000 })
      );
      if (response.status() >= 400) {
        linkResults.push({ href, status: response.status() });
      }
    } catch (e) {
      linkResults.push({ href, error: e.message });
    }
  }

  if (linkResults.length > 0) {
    console.log('Broken links:');
    linkResults.forEach(r => console.log(`  ${r.href}: ${r.status || r.error}`));
    fs.writeFileSync(path.join(shotsDir, 'broken-links.json'), JSON.stringify(linkResults, null, 2));
  } else {
    console.log('All links working!');
  }

  await context.close();
  await browser.close();

  // Summary
  console.log('\n=== SUMMARY ===');
  fs.writeFileSync(path.join(shotsDir, 'audit-results.json'), JSON.stringify(results, null, 2));
  console.log(`Results saved to ${shotsDir}`);
  console.log(JSON.stringify(results, null, 2));
}

capturePortfolio().catch(console.error);
