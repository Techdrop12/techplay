import { defineConfig, devices } from '@playwright/test'

/**
 * E2E Playwright – parcours critique e-commerce.
 * Lancer : npm run build && npm run start puis npm run test:e2e
 * Ou : npx playwright test (démarre le serveur si webServer configuré).
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'dot' : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer:
    process.env.CI || process.env.PLAYWRIGHT_BASE_URL
      ? undefined
      : {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
          timeout: 90_000,
        },
})
