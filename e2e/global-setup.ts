import { chromium, FullConfig } from '@playwright/test';

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL as string;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Get CSRF token required by NextAuth credentials POST
  const csrfRes = await context.request.get(`${baseURL}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();

  // Sign in directly via NextAuth credentials endpoint (no React form, no timing races)
  await context.request.post(`${baseURL}/api/auth/callback/credentials`, {
    form: {
      csrfToken,
      email: 'demo@fintrack.app',
      password: 'demo1234',
      callbackUrl: `${baseURL}/dashboard`,
      json: 'true',
    },
  });

  // Navigate to dashboard — session cookie is now set in the browser context
  await page.goto(`${baseURL}/dashboard`);
  await page.waitForURL(`${baseURL}/dashboard`, { timeout: 15000 });

  await context.storageState({ path: 'e2e/.auth.json' });
  await browser.close();
}
