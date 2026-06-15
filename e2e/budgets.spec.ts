import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth.json' });

test.beforeEach(async ({ page }) => {
  await page.goto('/budgets');
});

test('budgets page loads with month navigator and add button', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Previous month' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next month' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Budget' })).toBeVisible();
});

test('adds a budget and shows progress bar', async ({ page }) => {
  // Navigate 6 months forward to avoid conflicts with existing dev.db budgets
  for (let i = 0; i < 6; i++) {
    await page.getByRole('button', { name: 'Next month' }).click();
  }

  await page.getByRole('button', { name: 'Add Budget' }).click();
  await expect(page.getByRole('heading', { name: 'New Budget' })).toBeVisible();

  const modal = page.locator('.fixed');
  // Pick first available category dynamically (avoids hardcoding assumptions about dev.db state)
  await modal.locator('select').selectOption({ index: 0 });
  const categoryName = await modal.locator('select').inputValue();
  await modal.locator('input[type=number]').fill('300');
  await modal.getByRole('button', { name: 'Add Budget' }).click();

  const row = page.locator('div.divide-y').locator('div.group').filter({ hasText: categoryName });
  await expect(row).toBeVisible();
  await expect(row.locator('div.bg-gray-100.rounded-full')).toBeVisible();

  // Cleanup
  await row.hover();
  await row.getByRole('button', { name: 'Delete budget' }).click();
  await page.locator('.fixed').getByRole('button', { name: 'Delete' }).click();
  await expect(row).not.toBeVisible();
});

test('edits a budget limit', async ({ page }) => {
  // Navigate 6 months forward to avoid conflicts with existing dev.db budgets
  for (let i = 0; i < 6; i++) {
    await page.getByRole('button', { name: 'Next month' }).click();
  }

  // Create a budget to edit
  await page.getByRole('button', { name: 'Add Budget' }).click();
  const modal = page.locator('.fixed');
  // Pick first available category dynamically
  await modal.locator('select').selectOption({ index: 0 });
  const categoryName = await modal.locator('select').inputValue();
  await modal.locator('input[type=number]').fill('100');
  await modal.getByRole('button', { name: 'Add Budget' }).click();

  const row = page.locator('div.divide-y').locator('div.group').filter({ hasText: categoryName });
  await expect(row).toBeVisible();

  // Edit the limit
  await row.hover();
  await row.getByRole('button', { name: 'Edit budget' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Budget' })).toBeVisible();

  await modal.locator('input[type=number]').fill('250');
  await modal.getByRole('button', { name: 'Update' }).click();

  // "of 250,00 €" text uniquely identifies the updated limit
  await expect(row.getByText('of 250,00 €')).toBeVisible();

  // Cleanup
  await row.hover();
  await row.getByRole('button', { name: 'Delete budget' }).click();
  await page.locator('.fixed').getByRole('button', { name: 'Delete' }).click();
  await expect(row).not.toBeVisible();
});

test('deletes a budget', async ({ page }) => {
  // Create a budget to delete
  await page.getByRole('button', { name: 'Add Budget' }).click();
  const modal = page.locator('.fixed');
  await modal.locator('select').selectOption('Health');
  await modal.locator('input[type=number]').fill('50');
  await modal.getByRole('button', { name: 'Add Budget' }).click();

  const row = page.locator('div.divide-y').locator('div.group').filter({ hasText: 'Health' });
  await expect(row).toBeVisible();

  await row.hover();
  await row.getByRole('button', { name: 'Delete budget' }).click();
  await page.locator('.fixed').getByRole('button', { name: 'Delete' }).click();

  await expect(row).not.toBeVisible();
});

test('month navigation shows correct month label', async ({ page }) => {
  // System date is June 2026 — initial display is "June 2026"
  await expect(page.getByText('June 2026')).toBeVisible();

  await page.getByRole('button', { name: 'Previous month' }).click();
  await expect(page.getByText('May 2026')).toBeVisible();

  await page.getByRole('button', { name: 'Next month' }).click();
  await expect(page.getByText('June 2026')).toBeVisible();
});
