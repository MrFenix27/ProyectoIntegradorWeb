import { defineConfig } from '@playwright/test';

/**
 * Pruebas de funcionalidad desde el navegador (requisito 6.1)
 * y generación de evidencias en docs/evidencias (requisito 6.2).
 *
 * Requisito previo: el backend Spring Boot debe estar corriendo en
 * http://localhost:8080 (.\mvnw.cmd spring-boot:run).
 * El frontend lo levanta Playwright automáticamente (npm start).
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    locale: 'es-CL',
  },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
