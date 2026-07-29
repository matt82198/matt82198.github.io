// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Writing section filters', () => {
  test.beforeEach(async ({ page }) => {
    // Dev server running on port 4321
    await page.goto('http://localhost:4321');
    await page.waitForSelector('.writing-section');
  });

  test('should render writing section with filter buttons', async ({ page }) => {
    const filterControls = page.locator('.filter-controls');
    await expect(filterControls).toBeVisible();

    const recentBtn = page.locator('[data-sort="recent"]');
    const viewsBtn = page.locator('[data-sort="views"]');

    await expect(recentBtn).toBeVisible();
    await expect(viewsBtn).toBeVisible();
  });

  test('should toggle between most recent and most viewed', async ({ page }) => {
    // Get initial featured items from "most recent" view
    const recentBtn = page.locator('[data-sort="recent"]');
    const viewsBtn = page.locator('[data-sort="views"]');

    // Check initial state - recent should be active
    await expect(recentBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(viewsBtn).toHaveAttribute('aria-pressed', 'false');

    // Get first item from recent view
    const featuredRecentContainer = page.locator('[data-featured="true"][data-sort="recent"]');
    await expect(featuredRecentContainer).toBeVisible();
    const recentFirstTitle = await featuredRecentContainer.locator('h3').first().textContent();
    console.log('Recent first title:', recentFirstTitle);

    // Click most viewed button
    await viewsBtn.click();

    // Check button states changed
    await expect(recentBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(viewsBtn).toHaveAttribute('aria-pressed', 'true');

    // Recent container should be hidden
    const recentContainerStyle = await featuredRecentContainer.evaluate(el => el.getAttribute('style'));
    console.log('Recent container style after click:', recentContainerStyle);

    // Views container should be visible
    const featuredViewsContainer = page.locator('[data-featured="true"][data-sort="views"]');
    const viewsContainerStyle = await featuredViewsContainer.evaluate(el => el.getAttribute('style'));
    console.log('Views container style after click:', viewsContainerStyle);

    const viewsFirstTitle = await featuredViewsContainer.locator('h3').first().textContent();
    console.log('Views first title:', viewsFirstTitle);

    // Check that the first items are potentially different (or same if no views data)
    console.log('Are they the same?', recentFirstTitle === viewsFirstTitle);
  });

  test('should show list sections for both sorts', async ({ page }) => {
    const recentList = page.locator('[data-featured="false"][data-sort="recent"]');
    const viewsList = page.locator('[data-featured="false"][data-sort="views"]');

    await expect(recentList).toBeVisible();

    // Count items in recent list
    const recentItems = await recentList.locator('li').count();
    console.log('Recent list items:', recentItems);

    // Click views filter
    await page.locator('[data-sort="views"]').click();

    // Views list should now be visible
    await expect(viewsList).toBeVisible();

    // Recent list should be hidden
    const recentListStyle = await recentList.evaluate(el => el.getAttribute('style'));
    console.log('Recent list style:', recentListStyle);

    // Count items in views list
    const viewsItems = await viewsList.locator('li').count();
    console.log('Views list items:', viewsItems);
  });

  test('should have no console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Interact with filters
    await page.locator('[data-sort="views"]').click();
    await page.locator('[data-sort="recent"]').click();
    await page.locator('[data-sort="views"]').click();

    expect(errors).toHaveLength(0);
  });
});
