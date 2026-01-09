import { test, expect } from '@playwright/test';
import './playwright-coverage.js'

const BASE_URL = 'http://localhost:5000';

test.describe('DELETE Student Account – Frontend Tests', () => {

  // Helper to navigate to Delete section
 const goToDeleteSection = async (page) => {
  await page.goto(BASE_URL);
  await page.click('text=Delete Account');

  await expect(page.locator('#delete-form')).toBeVisible();

  await page.evaluate(() => {
    document.getElementById('delete-form')
      .setAttribute('novalidate', 'true');
  });
};



  // 1 Missing Student ID (Negative + Edge Case)
  test('should block deletion when Student ID is missing', async ({ page }) => {
    await goToDeleteSection(page);

    await page.locator('#confirm-delete').click();

    // Confirm dialog must NOT appear
    page.on('dialog', () => {
      throw new Error('Confirm dialog should not appear when ID is missing');
    });

    await page.locator('#delete-form').dispatchEvent('submit');

    await expect(page.locator('#delete-message'))
      .toContainText('Student ID');
  });

  // Confirmation Checkbox Not Checked (Negative + Safety)
  test('should block deletion when confirmation checkbox is not checked', async ({ page }) => {
    await goToDeleteSection(page);

    await page.fill('#delete-id', '1234567a');

    // Confirm dialog must NOT appear
    page.on('dialog', () => {
      throw new Error('Confirm dialog should not appear when checkbox is unchecked');
    });

    await page.locator('#delete-form').dispatchEvent('submit');

    await expect(page.locator('#delete-message'))
      .toContainText('confirm');
  });

  // User Cancels Browser Confirm Dialog (Edge Case)
  test('should cancel deletion when user dismisses confirmation dialog', async ({ page }) => {
    await goToDeleteSection(page);

    await page.fill('#delete-id', '1234567a');
    await page.locator('#confirm-delete').click();

    // User clicks "Cancel"
    page.once('dialog', dialog => dialog.dismiss());

    await page.locator('#delete-form').dispatchEvent('submit');

    await expect(page.locator('#delete-message'))
      .toContainText('cancelled');
  });

  // Non-Existent Student ID (Negative + Error Handling)
  test('should show error when deleting a non-existent student', async ({ page }) => {
    await goToDeleteSection(page);

    await page.fill('#delete-id', '9999999a');
  await page.check('#confirm-delete');

    page.once('dialog', dialog => dialog.accept());

     await page.click('button:has-text("Delete Account")');

    await page.locator('#delete-form').dispatchEvent('submit');


    await expect(page.locator('#delete-message'))
      .toContainText('not found');
  });

test('should show success message when deletion succeeds (mocked)', async ({ page }) => {
await page.route('**/api/students/**', route => {
    if (route.request().method() === 'DELETE') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Account deleted successfully.',
          deletedStudent: {
            id: '2403880d',
            rapid: 1200,
            blitz: 1100,
            bullet: 1000
          },
          remainingStudents: 3
        })
      });
    }
    route.continue();
  });

  await page.goto(BASE_URL);
  await page.click('text=Delete Account');

  await page.evaluate(() => {
  document.getElementById('delete-form').setAttribute('novalidate', true);
});

  await page.fill('#delete-id', '2403880d');
  await page.evaluate(() => {
  document.getElementById('confirm-delete').checked = true;
});



  page.once('dialog', d => d.accept());

await page.click('#delete-form button[type="submit"]');

  const msg = page.locator('#delete-message');
 await expect(msg).toBeVisible({ timeout: 5000 });
  await expect(msg).toContainText('Deleted Account Details');
});
});
