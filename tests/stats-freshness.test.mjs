import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const statsPath = path.join(projectRoot, 'src/data/aesop-stats.json');

const isStrict = process.env.CI === '1' || process.argv.includes('--strict');

test('Stats freshness and numeric keys validation', async (t) => {
  let stats;
  let summary = '';

  await t.test('loads aesop-stats.json', () => {
    const content = fs.readFileSync(statsPath, 'utf-8');
    stats = JSON.parse(content);
    assert.ok(stats, 'Stats JSON should load');
  });

  await t.test('validates required numeric keys exist and are positive integers', () => {
    const requiredNumericKeys = ['merged_prs', 'commits', 'test_files'];

    for (const key of requiredNumericKeys) {
      assert.ok(
        key in stats,
        `Stats should have "${key}" key`
      );
      assert.strictEqual(
        typeof stats[key],
        'number',
        `stats.${key} should be a number, got ${typeof stats[key]}`
      );
      assert.ok(
        Number.isInteger(stats[key]),
        `stats.${key} should be an integer, got ${stats[key]}`
      );
      assert.ok(
        stats[key] > 0,
        `stats.${key} should be positive, got ${stats[key]}`
      );
    }
  });

  await t.test('validates refreshed_at freshness', () => {
    const hasRefreshedAt = 'refreshed_at' in stats;

    if (!hasRefreshedAt) {
      if (isStrict) {
        assert.fail('stats.refreshed_at is missing; in strict/CI mode this must be present');
      } else {
        summary = 'WARN stale/missing refreshed_at';
        console.log('WARN: refreshed_at missing in stats (local snapshot allowed)');
        return;
      }
    }

    const refreshedAtStr = stats.refreshed_at;
    const refreshedAt = new Date(refreshedAtStr);

    assert.ok(
      !isNaN(refreshedAt.getTime()),
      `refreshed_at should parse as ISO-8601 date, got "${refreshedAtStr}"`
    );

    const now = new Date();
    const ageMs = now - refreshedAt;
    const ageHours = ageMs / (1000 * 60 * 60);

    if (ageHours > 48) {
      if (isStrict) {
        assert.fail(`refreshed_at is ${ageHours.toFixed(1)} hours old (threshold: 48h); in strict/CI mode this must be fresh`);
      } else {
        summary = 'WARN stale/missing refreshed_at';
        console.log(`WARN: refreshed_at is ${ageHours.toFixed(1)} hours old (local snapshot allowed)`);
      }
    } else {
      summary = `OK: stats fresh (${ageHours.toFixed(1)}h old)`;
      console.log(`✓ stats.refreshed_at is ${ageHours.toFixed(1)} hours old (within 48h threshold)`);
    }
  });

  // Print summary at end
  if (!summary) {
    if (isStrict) {
      summary = 'OK: all numeric keys present and fresh';
    } else {
      summary = 'OK: stats validation passed (non-strict)';
    }
  }

  console.log(`\n${summary}`);
});
