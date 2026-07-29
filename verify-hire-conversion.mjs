import fs from 'fs';
import path from 'path';

const distPath = path.join('.', 'dist', 'index.html');
const html = fs.readFileSync(distPath, 'utf-8');

console.log('=== Hire Conversion Verification ===\n');

const checks = [
  {
    name: 'Hero contains "AI platform"',
    test: () => html.includes('AI platform'),
  },
  {
    name: 'Hero contains "agent infrastructure"',
    test: () => html.includes('agent infrastructure'),
  },
  {
    name: 'Hero contains "Chicago"',
    test: () => html.includes('Chicago'),
  },
  {
    name: 'Resume PDF link exists',
    test: () => html.includes('/Matt_Culliton_Resume.pdf'),
  },
  {
    name: 'Resume PDF file exists in dist',
    test: () => fs.existsSync(path.join('.', 'dist', 'Matt_Culliton_Resume.pdf')),
  },
  {
    name: 'Mailto link present',
    test: () => html.includes('mailto:matt82198@gmail.com'),
  },
  {
    name: 'Nav shows "Aesop" (not "Fleet")',
    test: () => html.includes('<a href="#fleet"') && html.includes('>Aesop</a>') && !html.includes('<a href="#fleet">Fleet</a>'),
  },
  {
    name: 'Header subtitle renders',
    test: () => html.includes('Senior Software Engineer') && html.includes('AI Platforms') && html.includes('Agents'),
  },
  {
    name: 'Badge text updated to "recorded demo"',
    test: () => html.includes('recorded demo') && html.includes('live data at github.com/matt82198/aesop'),
  },
  {
    name: 'PR stat reframed to "system he built"',
    test: () => html.includes('PRs merged by the system he built'),
  },
  {
    name: 'PR stat links to GitHub',
    test: () => html.includes('450</span> PRs merged by the system he built</a>') && html.includes('https://github.com/matt82198/aesop/pulls?q=is%3Apr+is%3Amerged'),
  },
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
  const result = check.test();
  if (result) {
    console.log(`✓ ${check.name}`);
    passed++;
  } else {
    console.log(`✗ ${check.name}`);
    failed++;
  }
});

console.log(`\n=== Summary ===`);
console.log(`✓ Passed: ${passed}`);
console.log(`✗ Failed: ${failed}`);
console.log(`Total:   ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
}
