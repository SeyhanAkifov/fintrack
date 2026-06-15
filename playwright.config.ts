import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  workers: 1,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // In CI: delete stale DB, push schema, seed, start server with e2e.db
    // In dev: reuse the running dev server (reuseExistingServer: true)
    command: 'del /f /q "e2e\\e2e.db" 2>nul & npx prisma db push && npx tsx prisma/seed.ts && npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL: 'file:./e2e/e2e.db',
    },
  },
});
