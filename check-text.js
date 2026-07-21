import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'dist', 'index.html');
const fileUrl = `file:///${distPath.replace(/\/g, '/')}`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 720 }
});

await page.goto(fileUrl);
await page.waitForLoadState('networkidle');

const text = await page.textContent('body');

// Find "waves" in the text
const regex = /\bwaves\b/i;
if (regex.test(text)) {
  const lines = text.split('\n');
  console.log('Found "waves" in:');
  lines.forEach((line, idx) => {
    if (/\bwaves\b/i.test(line)) {
      console.log(`Line ${idx}: ${line.substring(0, 120)}`);
    }
  });
} else {
  console.log('No "waves" found in visible text');
}

await browser.close();
