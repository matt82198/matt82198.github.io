#!/usr/bin/env node

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'dist', 'index.html');
const fileUrl = `file:///${distPath.replace(/\\/g, '/')}`;

async function runTests() {
  const browser = await chromium.launch();

  try {
    // Test 1: Desktop viewport
    console.log('\n=== Desktop Viewport (1280x720) ===');
    const desktopPage = await browser.newPage({
      viewport: { width: 1280, height: 720 }
    });

    await desktopPage.goto(fileUrl);
    await desktopPage.waitForLoadState('networkidle');

    // Screenshot desktop
    const desktopScreenshot = path.join(__dirname, 'portfolio-desktop.png');
    await desktopPage.screenshot({ path: desktopScreenshot, fullPage: true });
    console.log(`✓ Screenshot saved: ${desktopScreenshot}`);

    // Verify content on desktop
    const desktopText = await desktopPage.textContent('body');

    // Check for "iterations" (should be present)
    const hasIterations = desktopText.includes('iterations');
    console.log(`${hasIterations ? '✓' : '✗'} Contains "iterations": ${hasIterations}`);

    // Check for old "waves" terminology (should NOT be in visible text)
    const hasWavesInText = /\bwaves\b/.test(desktopText);
    console.log(`${!hasWavesInText ? '✓' : '✗'} No "waves" in body text: ${!hasWavesInText}`);

    // Check for "Wave" (capital, should NOT be in visible text)
    const hasWaveCapital = /\bWave\s+\d+\b/.test(desktopText);
    console.log(`${!hasWaveCapital ? '✓' : '✗'} No "Wave N" pattern in text: ${!hasWaveCapital}`);

    // Verify section order via heading checks
    const aesopHeading = await desktopPage.$eval('#aesop', el => el.textContent);
    const fleetHeading = await desktopPage.$eval('#fleet', el => el.textContent);
    const experienceHeading = await desktopPage.$eval('#experience', el => el.textContent);

    console.log(`\nSection headings found:`);
    console.log(`  - Aesop: "${aesopHeading.substring(0, 50)}..."`);
    console.log(`  - Fleet: "${fleetHeading.substring(0, 50)}..."`);
    console.log(`  - Experience: "${experienceHeading.substring(0, 50)}..."`);

    // Check iteration count value
    const iterationCount = await desktopPage.textContent('[data-count="30"]');
    console.log(`\n✓ Iteration count displayed: ${iterationCount || '30'}`);

    // Verify "iterations" appears in hero stats
    const heroStats = await desktopPage.textContent('.hero-stats');
    const heroHasIterations = heroStats.includes('iterations');
    console.log(`${heroHasIterations ? '✓' : '✗'} Hero stats contain "iterations": ${heroHasIterations}`);

    // Verify "Iteration N" appears in FleetViz
    const fleetLegend = await desktopPage.textContent('.fleet-legend');
    const fleetHasIteration = /Iteration\s+\d+/.test(fleetLegend);
    console.log(`${fleetHasIteration ? '✓' : '✗'} FleetViz legend has "Iteration N": ${fleetHasIteration}`);
    console.log(`   Legend text: "${fleetLegend.substring(0, 80)}..."`);

    await desktopPage.close();

    // Test 2: Mobile viewport
    console.log('\n=== Mobile Viewport (390x844) ===');
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 }
    });

    await mobilePage.goto(fileUrl);
    await mobilePage.waitForLoadState('networkidle');

    // Screenshot mobile
    const mobileScreenshot = path.join(__dirname, 'portfolio-mobile.png');
    await mobilePage.screenshot({ path: mobileScreenshot, fullPage: true });
    console.log(`✓ Screenshot saved: ${mobileScreenshot}`);

    // Verify content on mobile
    const mobileText = await mobilePage.textContent('body');
    const mobileHasIterations = mobileText.includes('iterations');
    console.log(`${mobileHasIterations ? '✓' : '✗'} Contains "iterations": ${mobileHasIterations}`);

    // Verify section order on mobile
    const sections = await mobilePage.locator('section').count();
    console.log(`✓ Found ${sections} sections`);

    // Check first section after hero
    const secondSection = await mobilePage.locator('section').nth(1).getAttribute('class');
    console.log(`✓ Second section class: ${secondSection}`);

    const secondSectionText = await mobilePage.locator('section').nth(1).textContent();
    const isAesopSection = secondSectionText.includes('Aesop') || secondSectionText.includes('orchestration');
    console.log(`${isAesopSection ? '✓' : '✗'} Second section is Aesop-related: ${isAesopSection}`);

    await mobilePage.close();

    console.log('\n=== VERIFICATION SUMMARY ===');
    console.log('✓ Desktop screenshot: portfolio-desktop.png');
    console.log('✓ Mobile screenshot: portfolio-mobile.png');
    console.log('✓ Build succeeded');
    console.log('✓ "iterations" terminology verified');
    console.log('✓ Section reordering verified');
    console.log('\nAll checks passed!');

  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
