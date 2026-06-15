import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth.json' });

test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard');
});

test('summary cards are visible', async ({ page }) => {
  await expect(page.getByText('Income').first()).toBeVisible();
  await expect(page.getByText('Expenses').first()).toBeVisible();
  await expect(page.getByText('Balance').first()).toBeVisible();
});

test('Budget Health card is visible', async ({ page }) => {
  await expect(page.getByText('Budget Health')).toBeVisible();
  // Either empty-state or detail link — both include "budgets"
  await expect(page.getByRole('link', { name: /budgets/i }).first()).toBeVisible();
});

test('chart section headings are visible', async ({ page }) => {
  await expect(page.getByText('Expenses by Category')).toBeVisible();
  await expect(page.getByText('Balance Over Time')).toBeVisible();
});

test('Budget Health card link navigates to /budgets', async ({ page }) => {
  await page.getByRole('link', { name: /set up budgets|view budgets/i }).click();
  await expect(page).toHaveURL(/\/budgets/);
});
