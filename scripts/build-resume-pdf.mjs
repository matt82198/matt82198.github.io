#!/usr/bin/env node
/**
 * Build-time PDF generation for the resume page.
 *
 * Replaces the hand-exported Word PDF with a deterministic render of
 * dist/resume/index.html: a tiny static file server (plain Node http/fs,
 * no new dependency) serves dist/ so the page's absolute-path assets
 * (/_astro/*.css) resolve correctly -- opening the file directly via a
 * file:// URL would leave the page unstyled, since those hrefs would
 * resolve against the filesystem root instead of dist/.
 *
 * Playwright (already a devDependency: playwright + @playwright/test) then
 * opens that page, emulates print media so the resume's `@media print`
 * rules apply, and renders a Letter-sized PDF to dist/Matt_Culliton_Resume.pdf.
 *
 * Runs as the `postbuild` npm script, so `npm run build` always produces
 * this file after `astro build` -- it is written AFTER the build completes
 * and therefore overwrites whatever public/Matt_Culliton_Resume.pdf was
 * copied into dist/ during the build.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const outputPath = path.join(distDir, 'Matt_Culliton_Resume.pdf');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

/** Minimal static file server over dist/, so absolute asset paths resolve. */
function createDistServer() {
  return http.createServer((req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let relPath = urlPath;
      if (relPath.endsWith('/')) relPath += 'index.html';

      let filePath = path.join(distDir, relPath);

      // Guard against path traversal outside dist/.
      if (!filePath.startsWith(distDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      if (!fs.existsSync(filePath)) {
        // Fall back to directory index (e.g. "/resume" -> "/resume/index.html").
        const asIndex = path.join(filePath, 'index.html');
        if (fs.existsSync(asIndex)) {
          filePath = asIndex;
        } else {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      res.writeHead(500);
      res.end(String(err));
    }
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    // Port 0 => OS-assigned free port; avoids clashing with astro dev/preview.
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

async function main() {
  if (!fs.existsSync(distDir)) {
    console.error(`[build-resume-pdf] dist/ not found at ${distDir} -- run "astro build" first.`);
    process.exit(1);
  }

  const resumePage = path.join(distDir, 'resume', 'index.html');
  if (!fs.existsSync(resumePage)) {
    console.error(`[build-resume-pdf] ${resumePage} not found -- is src/pages/resume.astro building?`);
    process.exit(1);
  }

  const server = createDistServer();
  const port = await listen(server);
  const url = `http://127.0.0.1:${port}/resume/`;

  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({
      path: outputPath,
      format: 'Letter',
      printBackground: false,
      // Keep in sync with the `@page { margin }` rule in src/pages/resume.astro.
      margin: { top: '0.3in', bottom: '0.3in', left: '0.3in', right: '0.3in' },
    });
    console.log(`[build-resume-pdf] wrote ${path.relative(projectRoot, outputPath)}`);
  } finally {
    await browser?.close();
    server.close();
  }
}

main().catch((err) => {
  console.error('[build-resume-pdf] failed:', err);
  process.exit(1);
});
