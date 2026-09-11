#!/usr/bin/env node
/**
 * Checks for numeric claims in Astro files that lack proper sourcing.
 * 
 * Rules:
 * (a) Value interpolated from imported data in {...} expressions
 * (b) Inline HTML comment source marker <!-- src: <path-or-url> --> on same/previous line
 * (c) Listed allowlist (years/dates, version strings like 0.8.0, times)
 * 
 * Output: violations with file:line and the bare number
 * Modes: WARN by default (exit 0), --strict exits 1
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

// Allowlist patterns - these match ONLY the number part, not surrounding context
const allowlist = [
  // Years only (19xx, 20xx) - but must be 4 digits
  /^(19|20)\d{2}$/,
  // Version strings (e.g., 0.8.0, v1.2.3) - must have at least one dot
  /^v?\d+\.\d+(\.\d+)?$/,
  // Times (e.g., 3:45, 10:30) - must have colon
  /^\d{1,2}:\d{2}(:\d{2})?(am|pm|AM|PM)?$/,
  // Commit hashes and PR numbers (e.g., #123, #ff692a18)
  /^#\d+$/,
  // Hash-like strings (lowercase hex, at least 7 chars)
  /^[a-f0-9]{7,}$/,
  // Memory/storage units (1KB, 2GB, etc.) - these will be in the text
  /^\d+(KB|MB|GB|TB|B|kB|mB)$/i,
  // Line numbers in specific contexts
  /^line\s+\d+$/i,
];

// Determine if a number is in the allowlist
function isAllowlisted(numberStr) {
  const clean = numberStr.trim();
  return allowlist.some(pattern => pattern.test(clean));
}

// Determine if a number is part of a larger interpolated expression
function isPartOfInterpolation(line, numberStr, startPos) {
  // Check if this number appears inside {...}
  const beforeText = line.substring(0, startPos);
  const lastOpenBrace = beforeText.lastIndexOf('{');

  if (lastOpenBrace >= 0) {
    const afterOpenBrace = line.substring(lastOpenBrace);
    const closeBracePos = afterOpenBrace.indexOf('}');
    if (closeBracePos > 0) {
      const braceContent = afterOpenBrace.substring(1, closeBracePos);
      // If the number is in interpolation context, it's likely sourced
      if (braceContent.includes(numberStr) || /[a-zA-Z_$]/.test(braceContent)) {
        return true;
      }
    }
  }

  return false;
}

// Check if a line has a source marker on it or the previous line
function hasSourceMarker(lines, lineIndex) {
  const currentLine = lines[lineIndex] || '';
  const prevLine = lineIndex > 0 ? lines[lineIndex - 1] : '';
  
  const sourceMarkerPattern = /<!--\s*src:\s*(.+?)\s*-->/;
  return sourceMarkerPattern.test(currentLine) || sourceMarkerPattern.test(prevLine);
}

// Extract import statements from Astro file
function extractImports(content) {
  const imports = new Set();
  const importPattern = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importPattern.exec(content)) !== null) {
    imports.add(match[1]);
  }
  
  return imports;
}

// Check if a number is interpolated from imports
function isInterpolatedFromImport(line, imports) {
  // Check for {...} interpolation patterns that reference imported variables
  const interpolationPattern = /\{([a-zA-Z_$][a-zA-Z0-9_$.]*)/g;
  let match;
  
  while ((match = interpolationPattern.exec(line)) !== null) {
    const varName = match[1].split('.')[0]; // Get first part for namespace access
    // If this variable matches an import, consider it sourced
    for (const importPath of imports) {
      const importName = path.basename(importPath, path.extname(importPath));
      if (varName === importName || varName.match(new RegExp(importName, 'i'))) {
        return true;
      }
    }
  }
  
  return false;
}

// Find numeric claims in visible text (not in style/data attributes)
function findNumericClaims(content, filePath) {
  const lines = content.split('\n');
  const violations = [];
  const imports = extractImports(content);

  // Extract visible text only (exclude style/script tags and data attributes)
  let inStyleTag = false;
  let inScriptTag = false;
  let inFrontmatter = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track frontmatter
    if (/^---/.test(line.trim())) {
      inFrontmatter = !inFrontmatter;
      continue;
    }

    if (inFrontmatter) continue;

    // Track style tags
    if (/<style/i.test(line)) {
      inStyleTag = true;
    }
    if (/<\/style>/i.test(line)) {
      inStyleTag = false;
      continue;
    }

    // Track script tags
    if (/<script/i.test(line)) {
      inScriptTag = true;
    }
    if (/<\/script>/i.test(line)) {
      inScriptTag = false;
      continue;
    }

    if (inStyleTag || inScriptTag) continue;

    // Skip lines that are clearly CSS or pure config
    if (/^[^<]*:\s*\d+\s*[px;%]|padding|margin|width|height|font-size|gap|space-/.test(line)) {
      continue;
    }

    // Extract text content, removing HTML tags and attributes
    const textContent = extractTextContent(line);
    if (!textContent.trim()) continue;

    // Find ALL numeric patterns in the text
    // Match: numbers with commas (1,000), decimals (2.18), percentages (60%), +/- signs
    const numericPattern = /([+-]?)([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)(?:\.[0-9]+)?/g;

    let match;
    while ((match = numericPattern.exec(textContent)) !== null) {
      const fullNumber = match[0];
      const numberOnly = match[2].replace(/,/g, ''); // Remove commas for comparison

      // Skip single-digit numbers and zero
      if (parseInt(numberOnly) < 10) {
        continue;
      }

      // Skip if part of interpolation or has interpolation on line
      if (line.includes('{') && line.includes('}')) {
        if (isInterpolatedFromImport(line, imports) || isPartOfInterpolation(line, fullNumber, match.index)) {
          continue;
        }
      }

      // Skip if allowlisted
      if (isAllowlisted(fullNumber)) {
        continue;
      }

      // Skip if line contains a source marker
      if (hasSourceMarker(lines, i)) {
        continue;
      }

      violations.push({
        file: filePath,
        line: i + 1,
        number: fullNumber,
        fullLine: line.trim(),
      });
    }
  }

  return violations;
}

// Extract visible text content from a line, removing HTML tags and non-content
function extractTextContent(line) {
  let text = line;

  // FIRST: Extract only the text parts between > and < (visible text content)
  const textParts = [];
  let inTag = false;
  let currentText = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '<') {
      if (currentText) {
        textParts.push(currentText);
        currentText = '';
      }
      inTag = true;
    } else if (char === '>') {
      inTag = false;
    } else if (!inTag) {
      currentText += char;
    }
  }

  if (currentText) {
    textParts.push(currentText);
  }

  text = textParts.join(' ');

  // Remove HTML entities
  text = text.replace(/&[#a-zA-Z0-9]+;/g, ' ');

  // Remove URLs (they often contain numbers)
  text = text.replace(/https?:\/\/[^\s)]+/g, ' ');
  text = text.replace(/www\.[^\s)]+/g, ' ');

  // Remove email addresses
  text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ' ');

  // Remove dates in common formats like "2026-07-31"
  text = text.replace(/\d{4}-\d{2}-\d{2}/g, ' ');
  text = text.replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, ' ');

  // Remove hex color codes and hash references
  text = text.replace(/#[0-9a-fA-F]{6}/g, ' ');

  // Remove commit-like hashes (long alphanumeric strings)
  text = text.replace(/\b[a-f0-9]{7,}\b/g, ' ');

  // Remove paths and identifiers that look like they're in code/hashes
  text = text.replace(/\/[a-zA-Z0-9_-]+\//g, ' ');
  text = text.replace(/\.[a-zA-Z0-9_]+\(/g, '( ');

  // Remove fractions like ~1/3 or 1/3
  text = text.replace(/~?\d+\/\d+/g, ' ');

  return text;
}

// Recursively find all .astro files
function findAstroFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findAstroFiles(fullPath));
    } else if (entry.name.endsWith('.astro')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
async function main() {
  const strict = process.argv.includes('--strict');
  
  // Find all Astro files
  const astroFiles = findAstroFiles(srcDir);
  
  let violations = [];
  
  for (const filePath of astroFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const fileViolations = findNumericClaims(content, filePath);
      violations.push(...fileViolations);
    } catch (error) {
      console.error(`Error reading ${filePath}: ${error.message}`);
      process.exit(1);
    }
  }
  
  // Report violations
  if (violations.length > 0) {
    console.log(`Found ${violations.length} unsourced numeric claim(s):\n`);
    for (const violation of violations) {
      const relPath = path.relative(projectRoot, violation.file);
      console.log(`${relPath}:${violation.line}`);
      console.log(`  Number: ${violation.number}`);
      console.log(`  Context: ${violation.fullLine.substring(0, 80)}`);
      console.log();
    }
    
    if (strict) {
      process.exit(1);
    }
  } else {
    console.log('✓ All numeric claims are properly sourced.');
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
