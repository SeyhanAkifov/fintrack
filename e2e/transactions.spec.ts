import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth.json' });

test.beforeEach(async ({ page }) => {
  await page.goto('/transactions');
});

test('transaction list loads with seeded data', async ({ page }) => {
  const rows = page.locator('div.divide-y').first().locator('div.group');
  await expect(rows.first()).toBeVisible();
});

test('adds a new transaction', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Transaction' }).click();
  await expect(page.getByRole('heading', { name: 'New Transaction' })).toBeVisible();

  await page.fill('#amount', '55.00');
  await page.selectOption('#type', 'expense');
  await page.selectOption('#category', 'Food');
  await page.fill('#date', '2026-06-15');

  await page.locator('.fixed').getByRole('button', { name: 'Add Transaction' }).click();

  // German locale: 55.00 → "55,00 €"
  await expect(page.getByText('55,00').first()).toBeVisible();
});

test('edits an existing transaction', async ({ page }) => {
  const rows = page.locator('div.divide-y').first().locator('div.group');
  const firstRow = rows.first();
  await firstRow.hover();
  await firstRow.getByRole('button', { name: 'Edit' }).click();

  await expect(page.getByRole('heading', { name: 'Edit Transaction' })).toBeVisible();

  await page.fill('#amount', '77.77');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByText('77,77').first()).toBeVisible();
});

test('deletes a transaction', async ({ page }) => {
  const rows = page.locator('div.divide-y').first().locator('div.group');
  const countBefore = await rows.count();
  expect(countBefore).toBeGreaterThan(0);

  await rows.first().hover();
  await rows.first().getByRole('button', { name: 'Delete' }).click();

  // Confirm in modal
  await page.locator('.fixed').getByRole('button', { name: 'Delete' }).click();

  await expect(rows).toHaveCount(countBefore - 1);
});

test('filters transactions by category', async ({ page }) => {
  await page.locator('select').first().selectOption('Food');
  await page.waitForResponse('**/api/transactions*');

  const rows = page.locator('div.divide-y').first().locator('div.group');
  const count = await rows.count();

  // Verify first few rows are all Food
  for (let i = 0; i < Math.min(count, 3); i++) {
    await expect(rows.nth(i).getByText('Food')).toBeVisible();
  }
});

test('CSV export triggers a file download', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/transactions/);
});
