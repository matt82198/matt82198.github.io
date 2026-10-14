import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const url = 'https://matt82198.github.io';
const screenshotDir = resolve('/c/Users/matt8/AppData/Local/Temp/claude/C--Users-matt8-aesop/90b96afc-2018-46a9-b7b4-2935d5ac34e9/scratchpad/shots-closing');

// Ensure directory exists
try {
  mkdirSync(screenshotDir, { recursive: true });
} catch (e) {
  console.error('Failed to create directory:', e);
}

const viewports = [
  { name: '390x844', width: 390, height: 844 },
  { name: '1440x900', width: 1440, height: 900 }
];

(async () => {
  const browser = await chromium.launch();
  
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    
    const ctaLocator = page.locator('.cta-links');
    const ctaBox = await ctaLocator.boundingBox();
    
    const screenshotPath = resolve(screenshotDir, `viewport-${viewport.name}.png`);
    await page.screenshot({ path: screenshotPath });
    
    console.log(`\n${viewport.name}:`);
    console.log(`  Page height: ${pageHeight}px`);
    console.log(`  Viewport height: ${viewportHeight}px`);
    if (ctaBox) {
      console.log(`  CTA bottom: ${(ctaBox.y + ctaBox.height).toFixed(1)}px`);
      console.log(`  Within first viewport: ${(ctaBox.y + ctaBox.height) <= viewportHeight ? 'YES ✓' : 'NO'}`);
    }
    console.log(`  Screenshot saved`);
    
    await page.close();
  }
  
  await browser.close();
})();
