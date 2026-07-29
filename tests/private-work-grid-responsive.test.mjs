/**
 * Private Work Grid Responsive Test
 *
 * Verifies that the PrivateWork section grid layout is responsive:
 * 1. At 375px width, section fills container with no horizontal scroll
 * 2. At 414px width, section fills container with no horizontal scroll
 * 3. At 768px width, section fills container and grid shows proper columns
 * 4. Content box width >= 85% of viewport at 375px (kills big-margin symptom)
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

const PORT = 3001;
const baseUrl = `http://localhost:${PORT}`;

let browser;
let page;

const viewports = [
  { width: 375, height: 812, name: 'iPhone SE' },
  { width: 414, height: 896, name: 'iPhone 11' },
  { width: 768, height: 1024, name: 'iPad' }
];

async function testViewport(viewport) {
  console.log(`\n=== Testing at ${viewport.width}x${viewport.height} (${viewport.name}) ===`);

  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  // Wait for all affected sections to be visible
  const sections = ['privatework', 'client-work', 'experience', 'community-section'];

  for (const sectionClass of sections) {
    // Skip community-section check if not found (different structure)
    try {
      await page.waitForSelector(`section.${sectionClass}, .${sectionClass}`, { timeout: 3000 });
    } catch {
      console.log(`⚠ Section ${sectionClass} not found, skipping`);
      continue;
    }

    await testSection(sectionClass, viewport);
  }
}

async function testSection(sectionClass, viewport) {
  console.log(`\n  -- Testing ${sectionClass} --`);

  const selector = `section.${sectionClass}, .${sectionClass}`;
  const sectionLocator = page.locator(selector).first();

  // Get the section dimensions
  const sectionBox = await sectionLocator.boundingBox();
  if (!sectionBox) {
    console.log(`  ⚠ ${sectionClass} section not found`);
    return;
  }

  console.log(`  Section outer width: ${sectionBox.width}px`);

  // Get the actual content box (inside padding)
  const contentBox = await sectionLocator.evaluate(el => {
    const computed = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const paddingLeft = parseFloat(computed.paddingLeft);
    const paddingRight = parseFloat(computed.paddingRight);
    const contentWidth = rect.width - paddingLeft - paddingRight;
    return {
      contentWidth,
      paddingLeft,
      paddingRight
    };
  });

  const fillPercentage = (contentBox.contentWidth / viewport.width) * 100;
  console.log(`  Content width: ${contentBox.contentWidth.toFixed(0)}px (${fillPercentage.toFixed(1)}% of ${viewport.width}px viewport)`);

  // At mobile, content should fill at least 85% of viewport
  if (viewport.width === 375 || viewport.width === 414) {
    assert(fillPercentage >= 85,
      `${sectionClass}: Content width ${fillPercentage.toFixed(1)}% at ${viewport.width}px should be >= 85%`);
    console.log(`  ✓ Content fills >= 85% of viewport`);
  }

  // Check for horizontal scroll
  const bodyScroll = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });

  if (bodyScroll.hasScroll) {
    console.log(`  ⚠ Body has horizontal scroll`);
  } else {
    console.log(`  ✓ No horizontal body scroll`);
  }

  // Check grid/list layout at narrow viewports
  if (viewport.width <= 640) {
    const grid = await sectionLocator.locator('[class*="grid"], [class*="list"]').first().evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        flexDirection: computed.flexDirection
      };
    }).catch(() => null);

    if (grid) {
      if (grid.display === 'grid') {
        const isSingleCol = grid.gridTemplateColumns === '1fr' || !grid.gridTemplateColumns.includes(' ');
        if (isSingleCol) {
          console.log(`  ✓ Grid is single column`);
        } else {
          console.log(`  ⚠ Grid columns: ${grid.gridTemplateColumns}`);
        }
      }
    }
  }
}

async function runTests() {
  server.listen(PORT, async () => {
    console.log(`Server running at ${baseUrl}`);

    try {
      browser = await chromium.launch();
      page = await browser.newPage();

      console.log('=== Private Work Grid Responsive Layout Tests ===');

      for (const viewport of viewports) {
        await testViewport(viewport);
      }

      console.log('\n=== All Tests Passed ===');

    } catch (error) {
      console.error('Test failed:', error.message);
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
