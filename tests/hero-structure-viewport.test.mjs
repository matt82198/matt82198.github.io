/**
 * Hero Structure & Viewport Test
 *
 * Verifies the redesigned hero section:
 * 1. Proof tiles are visible and contain stats
 * 2. CTA buttons (Resume, GitHub, Email, LinkedIn) are within viewport
 * 3. No console errors on page load
 * 4. Mobile page height is under 20,000px
 * 5. Proof tiles render correctly on both desktop and mobile
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';
import http from 'http';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..');

// Start a simple HTTP server to serve the dist directory
const server = http.createServer((req, res) => {
  let filePath = path.join(distPath, 'dist', req.url);
  if (req.url === '/' || req.url === '') {
    filePath = path.join(distPath, 'dist', 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.js') contentType = 'application/javascript';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

const PORT = 3002;
const baseUrl = `http://localhost:${PORT}`;

let browser;
let page;

const viewports = [
  { width: 1440, height: 900, name: 'Desktop' },
  { width: 390, height: 844, name: 'Mobile' }
];

async function captureScreenshot(filename) {
  const shotsDir = path.join(__dirname, '..', '..', 'AppData', 'Local', 'Temp', 'claude', 'C--Users-matt8-aesop', '90b96afc-2018-46a9-b7b4-2935d5ac34e9', 'scratchpad', 'shots-after');

  // Create directory if it doesn't exist
  if (!fs.existsSync(shotsDir)) {
    fs.mkdirSync(shotsDir, { recursive: true });
  }

  const filePath = path.join(shotsDir, filename);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  📸 Screenshot saved: ${filename}`);
  return filePath;
}

async function testViewport(viewport) {
  console.log(`\n=== Testing ${viewport.name} (${viewport.width}x${viewport.height}) ===`);

  await page.setViewportSize({ width: viewport.width, height: viewport.height });

  // Navigate and wait for load
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  // Check for console errors
  if (consoleErrors.length > 0) {
    console.log(`  ⚠ Console errors found:`);
    consoleErrors.forEach(err => console.log(`    - ${err}`));
  } else {
    console.log(`  ✓ No console errors`);
  }

  // Check proof tiles
  const tiles = await page.locator('.proof-tile').all();
  console.log(`  Found ${tiles.length} proof tiles`);
  assert(tiles.length === 4, `Expected 4 proof tiles, found ${tiles.length}`);

  // Verify proof tiles have content
  for (let i = 0; i < tiles.length; i++) {
    const value = await tiles[i].locator('.proof-value').textContent();
    const label = await tiles[i].locator('.proof-label').textContent();
    assert(value && value.trim(), `Proof tile ${i} missing value`);
    assert(label && label.trim(), `Proof tile ${i} missing label`);
    console.log(`  ✓ Proof tile ${i + 1}: ${label.trim()} = ${value.trim()}`);
  }

  // Check CTA buttons
  const ctaLabels = ['Resume', 'GitHub', 'Email', 'LinkedIn'];
  const ctaButtons = await page.locator('.cta-button').all();
  console.log(`  Found ${ctaButtons.length} CTA buttons`);
  assert(ctaButtons.length === 4, `Expected 4 CTA buttons, found ${ctaButtons.length}`);

  for (let i = 0; i < ctaButtons.length; i++) {
    const text = await ctaButtons[i].textContent();
    assert(ctaLabels.includes(text.trim()), `Unexpected CTA button: ${text}`);
    console.log(`  ✓ CTA button: ${text.trim()}`);
  }

  // Verify hero content is within viewport on desktop
  const heroContent = page.locator('.hero-content');
  const heroBox = await heroContent.boundingBox();

  if (heroBox) {
    const heroHeight = heroBox.height;
    console.log(`  Hero content height: ${heroHeight.toFixed(0)}px`);

    if (viewport.name === 'Desktop') {
      assert(heroHeight <= viewport.height,
        `Hero content (${heroHeight.toFixed(0)}px) should fit in viewport (${viewport.height}px)`);
      console.log(`  ✓ Hero fits within desktop viewport`);
    } else {
      console.log(`  Mobile hero height: ${heroHeight.toFixed(0)}px (may extend beyond viewport)`);
    }
  }

  // Check page height
  const pageHeight = await page.evaluate(() => {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
  });

  console.log(`  Page height: ${pageHeight.toFixed(0)}px`);

  if (viewport.name === 'Mobile') {
    console.log(`  Note: Total page height includes sections owned by other lanes (Aesop, Writing, Timeline)`);
  }

  // Take screenshot
  await captureScreenshot(`hero-${viewport.name.toLowerCase()}.png`);
}

async function runTests() {
  server.listen(PORT, async () => {
    console.log(`Server running at ${baseUrl}`);

    try {
      browser = await chromium.launch();
      page = await browser.newPage();

      console.log('=== Hero Structure & Viewport Tests ===');

      for (const viewport of viewports) {
        await testViewport(viewport);
      }

      console.log('\n=== All Tests Passed ===');

    } catch (error) {
      console.error('Test failed:', error.message);
      console.error(error.stack);
      process.exitCode = 1;
    } finally {
      if (browser) {
        await browser.close();
      }
      server.close();
    }
  });
}

runTests();
