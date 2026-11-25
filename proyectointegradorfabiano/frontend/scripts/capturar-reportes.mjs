/**
 * Captura visual del reporte de Playwright y del informe técnico.
 * Salida: docs/evidencias/13-reporte-playwright.png y 14-informe-tecnico.png
 */
import { chromium } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(here, '..', '..');
const evidencias = path.join(raiz, 'docs', 'evidencias');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});

await page.goto(pathToFileURL(path.join(raiz, 'frontend', 'playwright-report', 'index.html')).href, {
  waitUntil: 'load',
});
await page.waitForTimeout(1800);
// El reporte ocupa solo la parte superior: se recorta para no dejar medio folio en blanco.
await page.screenshot({
  path: path.join(evidencias, '13-reporte-playwright.png'),
  clip: { x: 0, y: 0, width: 1440, height: 630 },
});

await page.goto(pathToFileURL(path.join(raiz, 'docs', 'reporte', 'informe.html')).href, {
  waitUntil: 'load',
});
await page.evaluate(async () => {
  await Promise.all(
    Array.from(document.images)
      .filter((img) => !img.complete)
      .map(
        (img) =>
          new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          })
      )
  );
  await document.fonts.ready;
});
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(evidencias, '14-informe-tecnico.png') });

await browser.close();
console.log('Capturas generadas en docs/evidencias/13-reporte-playwright.png y 14-informe-tecnico.png');
