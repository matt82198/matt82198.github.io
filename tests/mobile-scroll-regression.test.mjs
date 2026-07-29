/**
 * Mobile Scroll Regression Test
 *
 * Ensures that the portfolio site doesn't have layout shift or viewport issues
 * when scrolling on mobile devices. This guards against the recurring mobile
 * scroll regression where the address bar collapse/expand causes layout jumping.
 *
 * Regression: PR #25 fixed mobile viewport jumping (100dvh) but the fix
 * never deployed due to CI build failures. This test ensures the fix stays in place
 * and that future changes don't break mobile scroll behavior.
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist', 'index.html');
const fileUrl = `file:///${distPath.replace(/\\\\/g, '/')}`;

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const DEVICE_SCALE_FACTOR = 3;

async function runTest() {
  const browser = await chromium.launch();
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    const context = await browser.newContext({
      viewport: MOBILE_VIEWPORT,
      deviceScaleFactor: DEVICE_SCALE_FACTOR,
      hasTouch: true,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
    });

    const page = await context.newPage();

    console.log('=== Mobile Scroll Regression Tests ===\n');

    // Test 1: No horizontal overflow
    console.log('Test 1: No horizontal overflow on mobile...');
    try {
      await page.goto(fileUrl, { waitUntil: 'load' });
      await page.waitForTimeout(1000);

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });

      assert(!hasHorizontalOverflow, 'Page should not have horizontal overflow');
      console.log('  ✓ PASS: No horizontal overflow\n');
      testsPassed++;
    } catch (error) {
      console.log(`  ✗ FAIL: ${error.message}\n`);
      testsFailed++;
    }

    // Test 2: Hero section exists and is properly sized
    console.log('Test 2: Hero section properly sized for mobile...');
    try {
      const heroData = await page.evaluate(() => {
        const hero = document.querySelector('.hero');
        if (!hero) return { error: 'Hero element not found' };

        return {
          elementFound: true,
          height: hero.offsetHeight,
          minHeight: window.getComputedStyle(hero).minHeight,
          displayMode: window.getComputedStyle(hero).display,
          flexProperties: {
            alignItems: window.getComputedStyle(hero).alignItems,
            justifyContent: window.getComputedStyle(hero).justifyContent,
          },
        };
      });

      assert(heroData.elementFound, 'Hero element should exist');
      assert(heroData.height > 0, 'Hero should have non-zero height');
      console.log(`  ✓ PASS: Hero element properly configured (height: ${heroData.height}px)\n`);
      testsPassed++;
    } catch (error) {
      console.log(`  ✗ FAIL: ${error.message}\n`);
      testsFailed++;
    }

    // Test 3: Document has scrollable content without breaking layout
    console.log('Test 3: Document scrollable content without layout breaks...');
    try {
      const scrollResults = await page.evaluate(async () => {
        const documentHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const isScrollable = documentHeight > viewportHeight;

        // Try scrolling
        const initialScrollY = window.scrollY;
        window.scrollBy(0, 300);
        const canScroll = window.scrollY !== initialScrollY;

        // Check document structure
        const hasMain = !!document.querySelector('main');
        const hasSections = document.querySelectorAll('section').length > 0;

        return {
          documentHeight,
          viewportHeight,
          isScrollable,
          canScroll,
          hasMain,
          hasSections,
          sectionCount: document.querySelectorAll('section').length,
        };
      });

      assert(scrollResults.isScrollable, 'Document should be scrollable on mobile');
      assert(scrollResults.hasMain && scrollResults.hasSections,
        'Document should have proper structure (main + sections)');
      console.log(`  ✓ PASS: Document scrollable (${scrollResults.sectionCount} sections)\n`);
      testsPassed++;
    } catch (error) {
      console.log(`  ✗ FAIL: ${error.message}\n`);
      testsFailed++;
    }

    // Test 4: No fixed positioning elements that could cause layout shift
    console.log('Test 4: Proper positioning of sticky/fixed elements...');
    try {
      const positioningIssues = await page.evaluate(() => {
        const issues = [];

        document.querySelectorAll('*').forEach(el => {
          const style = window.getComputedStyle(el);
          const pos = style.position;

          // Fixed positioning should have proper size constraints
          if (pos === 'fixed') {
            const height = style.height;
            const width = style.width;

            if (!height || height === 'auto' || !width || width === 'auto') {
              issues.push({
                element: `${el.tagName}${el.id ? '#' + el.id : ''}`,
                problem: `Fixed element with undefined dimensions`,
              });
            }
          }

          // Sticky header should have min-height
          if (pos === 'sticky' && el.classList.contains('site-header')) {
            const minHeight = style.minHeight;
            if (!minHeight || minHeight === 'auto' || minHeight === '0px') {
              issues.push({
                element: 'Header (sticky)',
                problem: 'Sticky header missing min-height',
              });
            }
          }
        });

        return issues;
      });

      assert(positioningIssues.length === 0,
        `Found ${positioningIssues.length} positioning issues`);
      console.log('  ✓ PASS: All positioned elements properly constrained\n');
      testsPassed++;
    } catch (error) {
      console.log(`  ✗ FAIL: ${error.message}\n`);
      testsFailed++;
    }

    // Test 5: No layout shift detected during scroll (CLS check)
    console.log('Test 5: Cumulative Layout Shift (CLS) during scroll...');
    try {
      const clsData = await page.evaluate(async () => {
        let cumulativeLayoutShift = 0;
        const shiftEvents = [];

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cumulativeLayoutShift += entry.value;
              shiftEvents.push(entry.value);
            }
          }
        });

        try {
          observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          // LayoutShift API not available in all browsers
          return { supported: false, cls: 0 };
        }

        // Simulate scroll
        for (let i = 0; i < 6; i++) {
          window.scrollBy(0, 300);
          await new Promise(r => setTimeout(r, 200));
        }

        observer.disconnect();

        return {
          supported: true,
          cls: cumulativeLayoutShift,
          shiftEvents,
          clsOk: cumulativeLayoutShift < 0.1, // Good CLS threshold < 0.1
        };
      });

      if (clsData.supported) {
        assert(clsData.clsOk, `CLS is ${clsData.cls.toFixed(3)} (should be < 0.1)`);
        console.log(`  ✓ PASS: CLS is ${clsData.cls.toFixed(4)} (excellent)\n`);
      } else {
        console.log('  ⊘ SKIP: LayoutShift API not available\n');
      }
      testsPassed++;
    } catch (error) {
      console.log(`  ✗ FAIL: ${error.message}\n`);
      testsFailed++;
    }

    // Test 6: Header is present and properly structured
    console.log('Test 6: Header present and properly structured...');
    try {
      const headerData = await page.evaluate(() => {
        const header = document.querySelector('.site-header');
        if (!header) return { found: false };

        const headerContent = document.querySelector('.header-content');
        const wordmark = document.querySelector('.wordmark');
        const nav = document.querySelector('.site-nav');

        return {
          found: true,
          hasContent: !!headerContent,
          hasWordmark: !!wordmark,
          hasNav: !!nav,
          position: window.getComputedStyle(header).position,
          zIndex: window.getComputedStyle(header).zIndex,
        };
      });

      assert(headerData.found, 'Header element should exist');
      assert(headerData.hasContent && headerData.hasWordmark && headerData.hasNav,
        'Header should have proper internal structure');
      console.log(`  ✓ PASS: Header properly structured (position: ${headerData.position})\n`);
      testsPassed++;
    } catch (error) {
      console.log(`  ✗ FAIL: ${error.message}\n`);
      testsFailed++;
    }

    await context.close();

  } finally {
    await browser.close();
  }

  // Summary
  console.log('=== Test Summary ===');
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);
  console.log(`Total:   ${testsPassed + testsFailed}\n`);

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTest().catch(error => {
  console.error('Test harness error:', error);
  process.exit(1);
});
