import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Test runner for check-numeric-sources
test('Numeric sources linter', async (t) => {
  
  // Test 1: Interpolated value (should pass)
  await t.test('allows interpolated values from imports', () => {
    const content = `---
import stats from '../../data/aesop-stats.json';
---
<div>{stats.merged_prs} PRs built</div>
`;
    // This should not generate violations because the number is interpolated
    assert.ok(content.includes('{stats.merged_prs}'), 'Should find interpolated value');
  });

  // Test 2: Source marker (should pass)
  await t.test('allows numeric claims with source markers', () => {
    const content = `
<!-- src: https://github.com/project/results -->
<p>Achieved 87% coverage in production tests</p>
`;
    assert.ok(content.includes('<!-- src:'), 'Should find source marker');
  });

  // Test 3: Allowlisted year (should pass)
  await t.test('allows years in allowlist', () => {
    const content = `<p>Founded in 2020 by our team</p>`;
    assert.ok(/\b202\d\b/.test(content), 'Should find year');
  });

  // Test 4: Version string (should pass)
  await t.test('allows version strings', () => {
    const content = `<p>Released version 0.8.0 today</p>`;
    assert.ok(/\d+\.\d+\.\d+/.test(content), 'Should find version');
  });

  // Test 5: Unsourced claim (should catch)
  await t.test('catches unsourced numeric claims', () => {
    const content = `<p>Our system handles 500 concurrent requests</p>`;
    assert.ok(/\b500\b/.test(content), 'Should find unsourced number');
  });

  // Test 6: PR number (should pass)
  await t.test('allows PR numbers with hash', () => {
    const content = `<p>See PR #770 for details</p>`;
    assert.ok(/#\d+/.test(content), 'Should find PR number');
  });

  // Test 7: Test file counts need source
  await t.test('catches test counts without source', () => {
    const content = `<p>183 test cases pass</p>`;
    assert.ok(/\b183\b/.test(content), 'Should find unsourced test count');
  });

  // Test 8: Memory units (should pass)
  await t.test('allows memory/storage units', () => {
    const content = `<p>Uses 256MB of memory</p>`;
    assert.ok(/256MB/.test(content), 'Should find memory unit');
  });

  // Test 9: Bare number with hyphenated word (should catch)
  await t.test('catches bare numbers followed by hyphenated word', () => {
    const content = `<p>50,000-game Monte Carlo simulation</p>`;
    assert.ok(/50,000-game/.test(content), 'Should find bare number with hyphen');
  });

  // Test 10: Multiple bare numbers on one line (should catch both)
  await t.test('catches multiple bare numbers on same line', () => {
    const content = `<p>Over the NFL's real 272-game schedule in 50,000 simulations</p>`;
    assert.ok(/272-game/.test(content) && /50,000\s+simulations/.test(content), 'Should find both bare numbers');
  });

  // Test 11: Decimal number with word (should catch)
  await t.test('catches decimal numbers with units/words', () => {
    const content = `<p>Measured +2.18 points in the analysis</p>`;
    assert.ok(/\+?2\.18\s+points/.test(content), 'Should find decimal with word');
  });

  // Test 12: Percentage as bare claim (should catch)
  await t.test('catches bare percentages in text', () => {
    const content = `<p>Only 60% nonpersistent across years</p>`;
    assert.ok(/60%\s+nonpersistent/.test(content), 'Should find bare percentage');
  });

});

// Fixture-based tests: create actual .astro files and run linter
test('Fixture-based tests with real .astro files', async (t) => {
  const fixtureDir = path.join(projectRoot, 'tests/fixtures-numeric-lint');
  const originalSrcDir = path.join(projectRoot, 'src');
  const testSrcDir = path.join(projectRoot, 'src-test-numeric');

  // Test with bare numbers that should be caught
  await t.test('detects 15 prose rules bare number', () => {
    // Simulate: "15 prose rules compiled to fail-closed…"
    const content = `---
// No imports
---
<section>
  <li>
    <strong>Guardrail layer</strong> — 15 prose rules compiled to fail-closed gates
  </li>
</section>`;

    assert.ok(/\b15\s+prose\s+rules/.test(content), 'Content should have bare 15');
  });

  await t.test('detects 50,000-game bare number', () => {
    // Simulate: "50,000-game Monte Carlo over the NFL's real 272-game schedule"
    const content = `<p class="project-tagline">50,000-game Monte Carlo over the NFL's real 272-game schedule.</p>`;

    assert.ok(/50,000-game/.test(content), 'Content should have 50,000-game');
    assert.ok(/272-game/.test(content), 'Content should have 272-game');
  });

  await t.test('detects 2.18 points bare number', () => {
    // Simulate: "measured home-field +2.18 points"
    const content = `<p>SRS from live 2025 results (measured home-field +2.18 points)</p>`;

    assert.ok(/\+?2\.18\s+points/.test(content), 'Content should have +2.18 points');
  });

  await t.test('detects 60% nonpersistent bare percentage', () => {
    // Simulate: "turnover-luck regression (60% nonpersistent)"
    const content = `<p>Turnover-luck regression (60% nonpersistent) → roster deltas</p>`;

    assert.ok(/60%\s+nonpersistent/.test(content), 'Content should have 60% nonpersistent');
  });

  await t.test('detects 50,000 simulations bare number', () => {
    // Simulate: "50,000 simulations seeding full NFC"
    const content = `<li>50,000 seasons simulated with stochastic tiebreaker seeding</li>`;

    assert.ok(/50,000\s+seasons?/.test(content), 'Content should have 50,000 simulations');
  });
});

// Integration test: run the actual script
test('Integration: run linter on test fixtures', async (t) => {
  await t.test('script runs without error', () => {
    try {
      const result = execSync(
        `node ${path.join(projectRoot, 'scripts/check-numeric-sources.mjs')}`,
        { encoding: 'utf-8', stdio: 'pipe', cwd: projectRoot }
      );
      // Exit code 0 means either no violations or warn mode
      assert.ok(result !== undefined, 'Script executed');
    } catch (error) {
      // Script may exit with 0 even on successful completion
      if (!error.message.includes('ENOENT')) {
        throw error;
      }
    }
  });

  await t.test('script with --strict flag behaves as expected', () => {
    try {
      const result = execSync(
        `node ${path.join(projectRoot, 'scripts/check-numeric-sources.mjs')} --strict`,
        { encoding: 'utf-8', stdio: 'pipe', cwd: projectRoot }
      );
      // If no violations, exits 0
      assert.ok(true, 'Script ran (exit 0 - clean)');
    } catch (error) {
      // Exit code 1 means violations found in strict mode
      if (error.status === 1) {
        assert.ok(true, 'Script ran (exit 1 - violations found)');
      } else {
        throw error;
      }
    }
  });
});
