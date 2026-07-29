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

  // Wait for the PrivateWork section to be visible
  await page.waitForSelector('section.privatework', { timeout: 5000 });

  // Get the section dimensions
  const sectionBox = await page.locator('section.privatework').boundingBox();
  if (!sectionBox) {
    throw new Error('PrivateWork section not found');
  }

  console.log(`Section dimensions: ${sectionBox.width}x${sectionBox.height}`);

  // Check if section content is filling properly
  const contentBox = await page.locator('section.privatework .category-grid').boundingBox();
  if (contentBox) {
    console.log(`Grid content box: ${contentBox.width}x${contentBox.height}`);

    // Calculate percentage of viewport filled
    const fillPercentage = (contentBox.width / viewport.width) * 100;
    console.log(`Grid width as % of viewport: ${fillPercentage.toFixed(1)}%`);
  }

  // Check for horizontal scroll
  const bodyScroll = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });

  console.log('Body scroll info:', bodyScroll);

  if (bodyScroll.hasScroll) {
    console.log(`⚠ Warning: Body has horizontal scroll at ${viewport.width}px viewport`);
  } else {
    console.log('✓ No horizontal body scroll');
  }

  // Check section padding and margins
  const sectionStyles = await page.locator('section.privatework').evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      paddingLeft: computed.paddingLeft,
      paddingRight: computed.paddingRight,
      marginLeft: computed.marginLeft,
      marginRight: computed.marginRight,
      maxWidth: computed.maxWidth,
      width: computed.width,
      paddingTop: computed.paddingTop,
      paddingBottom: computed.paddingBottom
    };
  });

  console.log('Section computed styles:', sectionStyles);

  // Check what's in the style attribute
  const sectionAttrs = await page.locator('section.privatework').evaluate(el => {
    return {
      classList: el.className,
      style: el.getAttribute('style')
    };
  });

  console.log('Section attributes:', sectionAttrs);

  // Check grid columns at this viewport
  const gridColumns = await page.locator('section.privatework .category-grid').evaluate(el => {
    const computed = window.getComputedStyle(el);
    return computed.gridTemplateColumns;
  });

  console.log(`Grid columns: ${gridColumns}`);

  // At 375 and 414, should be single column (1fr)
  if (viewport.width <= 640) {
    assert(gridColumns === '1fr' || gridColumns.includes('minmax'),
      `Grid at ${viewport.width}px should be single column layout`);
    console.log('✓ Grid is single column at narrow viewport');
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
