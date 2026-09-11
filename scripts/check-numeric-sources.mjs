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

// Allowlist patterns
const allowlist = [
  // Years and dates
  /\b(19|20)\d{2}\b/,
  // Version strings (e.g., 0.8.0, v1.2.3)
  /\bv?\d+\.\d+(\.\d+)?\b/,
  // Times (e.g., 3:45pm, 10:30)
  /\d{1,2}:\d{2}\s*(am|pm|AM|PM)?/,
  // Commit hashes and PR numbers (already have # prefix or are alphanumeric)
  /#\d+/,
  // Line numbers in docs
  /line\s+\d+/i,
  // Memory/storage units (1KB, 2GB, etc.)
  /\d+\s*(KB|MB|GB|TB|B)\b/i,
];

// Determine if a number is in the allowlist
function isAllowlisted(numberStr) {
  return allowlist.some(pattern => pattern.test(numberStr));
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
  
  // Extract visible text only (exclude style tags and specific data attributes)
  let inStyleTag = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track style tags
    if (/^<style/i.test(line.trim())) {
      inStyleTag = true;
    }
    if (/<\/style>/i.test(line.trim())) {
      inStyleTag = false;
      continue;
    }
    
    if (inStyleTag) continue;
    
    // Skip script tags and frontmatter
    if (/^---/.test(line.trim()) || /^<script/i.test(line.trim()) || /^import\s/.test(line.trim())) {
      continue;
    }
    
    // Skip lines that are clearly CSS or config
    if (/:\s*\d+|padding|margin|width|height|font-size|gap|space-/.test(line)) {
      continue;
    }
    
    // Find numeric patterns in visible text
    // Look for: integers >= 10, percentages, "N tests/PRs/commits" patterns
    const numericPatterns = [
      /\b([1-9]\d+(?:\.\d+)?)\s*(%|tests|PRs?|commits?|tasks?|cases?|domains?|files?)\b/gi,
      /\b([1-9]\d+(?:\.\d+)?)%\b/g,
      /\b([1-9]\d+(?:\.\d+)?)\s*x\b/gi, // For "4x", "2.5x" etc
      /\b~\s*([1-9]\d+(?:\/\d+)?)\b/g, // For "~1/3" type claims
    ];
    
    for (const pattern of numericPatterns) {
      let match;
      pattern.lastIndex = 0; // Reset regex state
      
      while ((match = pattern.exec(line)) !== null) {
        const numberStr = match[1] || match[0];
        
        // Skip if in an interpolation context (handled separately)
        if (line.includes('{') && line.includes('}')) {
          if (isInterpolatedFromImport(line, imports)) {
            continue;
          }
        }
        
        // Skip if allowlisted
        if (isAllowlisted(numberStr)) {
          continue;
        }
        
        // Skip if line contains a source marker
        if (hasSourceMarker(lines, i)) {
          continue;
        }
        
        violations.push({
          file: filePath,
          line: i + 1,
          number: numberStr,
          fullLine: line.trim(),
        });
      }
    }
  }
  
  return violations;
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
