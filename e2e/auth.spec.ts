import { test, expect } from '@playwright/test';

// No storageState — all tests run as unauthenticated

test.describe('Protected routes', () => {
  for (const path of ['/dashboard', '/transactions', '/budgets']) {
    test(`${path} redirects to /signin when unauthenticated`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/signin/);
    });
  }
});

test.describe('Sign-in', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signin');
  });

  test('valid credentials redirect to dashboard', async ({ page }) => {
    await page.fill('input[name=email]', 'demo@fintrack.app');
    await page.fill('input[name=password]', 'demo1234');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });
    await expect(page.getByText('FinTrack').first()).toBeVisible();
  });

  test('invalid password shows error', async ({ page }) => {
    await page.fill('input[name=email]', 'demo@fintrack.app');
    await page.fill('input[name=password]', 'wrongpassword');
    await page.click('button[type=submit]');
    await expect(page.getByText('Invalid email or password')).toBeVisible();
    await expect(page).toHaveURL(/\/signin/);
  });
});

test.describe('Sign-up', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('new user signs up and lands on dashboard', async ({ page }) => {
    const email = `e2e-${Date.now()}@test.dev`;
    await page.fill('input[name=email]', email);
    await page.fill('input[name=password]', 'password123');
    await page.click('button[type=submit]');
    // bcrypt hash (cost 12) + sign-in compare = up to ~10s on slow machines
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });
  });

  test('duplicate email shows error', async ({ page }) => {
    await page.fill('input[name=email]', 'demo@fintrack.app');
    await page.fill('input[name=password]', 'password123');
    await page.click('button[type=submit]');
    await expect(page.locator('p.text-red-600')).toBeVisible();
    await expect(page).toHaveURL(/\/signup/);
  });
});
