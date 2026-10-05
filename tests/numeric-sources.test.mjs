import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const statsPath = path.join(projectRoot, 'src/data/aesop-stats.json');
const componentsDir = path.join(projectRoot, 'src/components');

test('Numeric sources validation', async (t) => {
  let stats;
  const violations = [];

  await t.test('loads aesop-stats.json', () => {
    const content = fs.readFileSync(statsPath, 'utf-8');
    stats = JSON.parse(content);
    assert.ok(stats, 'Stats JSON should load');
  });

  await t.test('scans Astro files for stats references and validates keys exist', () => {
    // Find all .astro files in src/components recursively
    const astroFiles = [];
    function walkDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (entry.name.endsWith('.astro')) {
          astroFiles.push(fullPath);
        }
      }
    }
    walkDir(componentsDir);
    assert.ok(astroFiles.length > 0, 'Should find Astro files');

    // Keys that are expected to arrive but not yet in stats (from other lanes)
    const incomingKeys = new Set([
      'refreshed_at',
      'releases',
      'incidents',
      'days_active',
      'first_commit_date',
      'merged_prs_source',
      'ref',
      'head_sha',
      'generated_at',
      'iteration_cycles'  // Used in ArchViz.astro but not yet in schema
    ]);

    for (const filePath of astroFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Split frontmatter (between --- and ---) from template
      const parts = content.split('---');
      const templateContent = parts.length > 2 ? parts.slice(2).join('---') : content;

      // Regex to find stats.<key> references (only in template interpolations and attributes)
      // Look for {stats.KEY} patterns and similar
      const statsRefRegex = /[\{\s]stats\.([a-zA-Z_]+)/g;
      let match;

      // Track line numbers relative to template content
      const templateLines = templateContent.split('\n');
      const frontmatterLines = parts.length > 1 ? parts[1].split('\n').length + 1 : 0;

      while ((match = statsRefRegex.exec(templateContent)) !== null) {
        const key = match[1];

        // Skip non-property references and array methods
        if (key === 'json' || key === 'map' || key === 'filter' || key === 'reduce' || key === 'forEach') continue;

        const lineNum = templateContent.substring(0, match.index).split('\n').length + frontmatterLines;
        const lineStart = templateContent.lastIndexOf('\n', match.index) + 1;
        const lineEnd = templateContent.indexOf('\n', match.index);
        const line = templateContent.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);

        // Check if key exists in stats or is incoming
        if (!(key in stats) && !incomingKeys.has(key)) {
          // Allow if guarded with ?? or != null on same line
          if (line.includes('??') || line.includes('!= null')) {
            // Allow missing key if guarded
            continue;
          }

          violations.push({
            file: path.relative(projectRoot, filePath),
            line: lineNum,
            key,
            content: line.trim()
          });
        }
      }
    }

    if (violations.length > 0) {
      const msg = violations.map(v =>
        `${v.file}:${v.line} - missing key "stats.${v.key}" (referenced but not in aesop-stats.json)`
      ).join('\n');
      assert.fail(`Found missing stats keys:\n${msg}`);
    }
  });

  await t.test('scans Hero and Aesop sections for bare numbers >= 100 in prose', () => {
    const bareNumberViolations = [];

    const heroPath = path.join(componentsDir, 'sections/Hero.astro');
    const aesopPath = path.join(componentsDir, 'sections/Aesop.astro');

    for (const filePath of [heroPath, aesopPath]) {
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Only check <p> tags (prose), not attributes, not CSS
        if (!line.includes('<p>') && !line.includes('<p ')) continue;

        // Extract text content between <p> and </p>
        const pContent = line.match(/<p[^>]*>([\s\S]*?)<\/p>/);
        if (!pContent) continue;

        const text = pContent[1];

        // Look for bare numbers >= 100 that are NOT:
        // 1. Years (19xx or 20xx)
        // 2. The literal "4.3"
        // 3. PR numbers with # (e.g., #770)
        // 4. Version strings (x.y.z format)
        // 5. Part of a monetary amount ($xxx)

        // First, remove known exemptions from text temporarily
        const exemptText = text
          .replace(/\b(19|20)\d{2}\b/g, '') // Remove years
          .replace(/\b4\.3\b/g, '')        // Remove literal 4.3
          .replace(/#\d+/g, '')            // Remove PR numbers
          .replace(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g, '') // Remove monetary amounts
          .replace(/\d+\.\d+\.\d+/g, '')  // Remove version strings (x.y.z)
          .replace(/\d+(?:MB|GB|TB|ms|s|%|px)/g, ''); // Remove numbers with units

        // Now check for any remaining bare numbers >= 100
        const bareNumberRegex = /\b(\d{1,2}|\d{3,})\b(?!\.\d)/;
        const matches = exemptText.matchAll(/\b(\d+)\b(?!\.\d)/g);

        for (const match of matches) {
          const num = parseInt(match[1], 10);
          if (num >= 100) {
            bareNumberViolations.push({
              file: path.relative(projectRoot, filePath),
              lineNum,
              number: num,
              context: text.trim().substring(0, 100)
            });
          }
        }
      }
    }

    if (bareNumberViolations.length > 0) {
      const msg = bareNumberViolations.map(v =>
        `${v.file}:${v.lineNum} - bare number "${v.number}" in prose (must use stats.* or source comment)\n  Context: "${v.context}"`
      ).join('\n');
      assert.fail(`Found bare numbers in prose:\n${msg}`);
    }
  });
});
