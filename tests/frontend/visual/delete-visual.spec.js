import { test, expect } from '@playwright/test';

test('Delete section visual regression', async ({ page }) => {
  await page.goto('http://localhost:5000');

  // Navigate to Delete section
  await page.click('text=Delete Account');

  // Wait for UI to stabilize
  await page.waitForSelector('#delete-form');

  // Visual assertion
  await expect(page).toHaveScreenshot('delete-section.png', {
  maxDiffPixelRatio: 0.02,
});

});
