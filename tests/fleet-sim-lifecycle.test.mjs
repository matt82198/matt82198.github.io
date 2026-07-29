/**
 * Fleet Sim Lifecycle Test
 *
 * Verifies that the hero section's fleet simulation is working correctly:
 * 1. Agent lifecycle is active (agents spawn and complete over time)
 * 2. At least 12 agents are visible at any time
 * 3. Agent rows are properly laid out as single-line flex rows (not stacked)
 * 4. Layout is left-aligned, not centered
 *
 * This test catches regressions in the fleet-sim component that ship broken
 * (e.g., frozen lifecycle with only 4 agents, stacked text layout, scrollbars).
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';
import http from 'http';
import fs from 'fs';
import { promisify } from 'util';

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

const PORT = 3000;
const baseUrl = `http://localhost:${PORT}`;

async function runTest() {
  // Start the HTTP server
  await new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`HTTP server started on ${baseUrl}`);
      resolve();
    });
  });

  const browser = await chromium.launch();
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('\n=== Fleet Sim Lifecycle Test ===\n');

    // Navigate to the page
    console.log('Loading portfolio page...');
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('#fleet-agents', { timeout: 5000 });

    // Wait for stylesheets to load
    await page.waitForTimeout(500);

    // Verify stylesheets are loaded
    const stylesheets = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.href);
    });
    console.log(`Stylesheets loaded: ${stylesheets.length}`);
    stylesheets.forEach((href, i) => console.log(`  ${i + 1}. ${href.split('/').pop()}`));

    // Check if CSS rules are actually in the stylesheet
    const cssRules = await page.evaluate(() => {
      const rules = [];
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText && rule.selectorText.includes('agent-row')) {
              rules.push({
                selector: rule.selectorText,
                display: rule.style.display || 'not set',
              });
            }
          }
        } catch (e) {
          // Cross-origin or protected stylesheets
        }
      }
      return rules;
    });
    console.log(`CSS rules for agent-row:`, cssRules);

    // Test 1: Agent lifecycle is active (capture state at 2s and 8s, assert difference)
    console.log('Test 1: Checking agent lifecycle...');
    try {
      await page.waitForTimeout(2000); // Wait for initial render + agents to spawn

      const agentListEl1 = await page.locator('#fleet-agents');
      const text1 = await agentListEl1.evaluate((el) => el.innerText);
      const lines1 = text1.split('\n').filter((l) => l.trim()).length;

      console.log(`  Capture 1 (at 2s): ${lines1} agent lines`);
      console.log(`  Sample: ${text1.split('\n').slice(0, 2).join(' | ')}`);

      await page.waitForTimeout(6000); // Wait 6 more seconds

      const agentListEl2 = await page.locator('#fleet-agents');
      const text2 = await agentListEl2.evaluate((el) => el.innerText);
      const lines2 = text2.split('\n').filter((l) => l.trim()).length;

      console.log(`  Capture 2 (at 8s): ${lines2} agent lines`);
      console.log(`  Sample: ${text2.split('\n').slice(0, 2).join(' | ')}`);

      // Assert the lifecycle is alive: text should have changed (agents updated)
      assert.notStrictEqual(
        text1,
        text2,
        'Agent list text should change over time (lifecycle must be active)'
      );

      testsPassed++;
      console.log('  ✓ Lifecycle is active (text changed between captures)\n');
    } catch (err) {
      testsFailed++;
      console.error('  ✗ Lifecycle test failed:', err.message, '\n');
    }

    // Test 2: Assert >= 12 agent rows present
    console.log('Test 2: Checking agent count...');
    try {
      const agentRows = await page.locator('.agent-row');
      const count = await agentRows.count();

      console.log(`  Agent rows found: ${count}`);
      assert.ok(count >= 12, `Expected >= 12 agents, found ${count}`);

      testsPassed++;
      console.log('  ✓ Agent count is adequate (>= 12)\n');
    } catch (err) {
      testsFailed++;
      console.error('  ✗ Agent count test failed:', err.message, '\n');
    }

    // Test 3: Assert agent rows are properly laid out (flex, not stacked/centered)
    console.log('Test 3: Checking agent row layout...');
    try {
      const firstAgentRow = page.locator('.agent-row').first();

      // Debug: check if element exists and get its attributes
      const elementInfo = await firstAgentRow.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          className: el.className,
          attributes: Array.from(el.attributes).map(a => `${a.name}="${a.value}"`).join(' '),
          display: computed.display,
          height: computed.height,
          textAlign: computed.textAlign,
          alignItems: computed.alignItems,
          innerHTML: el.innerHTML,
        };
      });

      console.log(`  Element info:`, elementInfo);

      const style = elementInfo;

      // Assert it's a flex row (not stacked text)
      assert.ok(
        style.display === 'flex' || style.display === '-webkit-box',
        `Agent row display should be 'flex', found '${style.display}'`
      );

      // Assert row height is reasonable (< 70px for compact rows, not stacked lines)
      const heightValue = parseFloat(style.height);
      assert.ok(
        heightValue < 70,
        `Agent row height should be < 70px for compact layout, found ${style.height}`
      );

      // Assert left alignment (not centered stacking)
      assert.notStrictEqual(
        style.textAlign,
        'center',
        `Agent row text-align should not be 'center', found '${style.textAlign}'`
      );

      testsPassed++;
      console.log('  ✓ Agent rows properly laid out (flex, compact, left-aligned)\n');
    } catch (err) {
      testsFailed++;
      console.error('  ✗ Layout test failed:', err.message, '\n');
    }

    // Test 4: Verify fleet-agents container has no scrollbar (overflow: hidden)
    console.log('Test 4: Checking fleet-agents container...');
    try {
      const agentsContainer = page.locator('#fleet-agents');

      const style = await agentsContainer.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          overflow: computed.overflow,
          overflowY: computed.overflowY,
          maxHeight: computed.maxHeight,
        };
      });

      console.log(`  Container style:`, style);

      assert.ok(
        style.overflow === 'hidden' || style.overflowY === 'hidden',
        `Fleet-agents should have overflow: hidden, found overflow='${style.overflow}', overflowY='${style.overflowY}'`
      );

      testsPassed++;
      console.log('  ✓ Fleet-agents container properly configured (no scrollbar)\n');
    } catch (err) {
      testsFailed++;
      console.error('  ✗ Container test failed:', err.message, '\n');
    }

    console.log(`\n=== Results ===`);
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);
    console.log(`Total: ${testsPassed + testsFailed}\n`);

    if (testsFailed > 0) {
      process.exit(1);
    }

    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
}

runTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
