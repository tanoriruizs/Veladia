import { defineConfig } from '@playwright/test';

// e2e: carga dist/ en un Chromium real (correr npm run build antes)
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  timeout: 60_000,
});
