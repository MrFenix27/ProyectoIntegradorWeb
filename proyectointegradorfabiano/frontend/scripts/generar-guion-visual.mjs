/**
 * Genera el PDF del guion de exposición con evidencia visual.
 *
 * Uso:
 *   cd frontend
 *   node scripts/generar-guion-visual.mjs
 *
 * Salida:
 *   - docs/reporte/Guion-Exposicion-ColdTrace.pdf
 *   - copia en el Escritorio, si existe
 */
import { chromium } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const here = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(here, '..', '..');
const htmlPath = path.join(raiz, 'docs', 'reporte', 'guion-exposicion-visual.html');
const pdfPath = path.join(raiz, 'docs', 'reporte', 'Guion-Exposicion-ColdTrace.pdf');

const escritorio = path.join(os.homedir(), 'OneDrive', 'Escritorio');
const destinoEscritorio = path.join(
  fs.existsSync(escritorio) ? escritorio : path.join(os.homedir(), 'Desktop'),
  'Guion-Exposicion-ColdTrace.pdf'
);

const header = `
<div style="width:100%;padding:0 16mm;font-family:'Segoe UI',Arial,sans-serif;font-size:7.5pt;color:#7b8794;">
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:0.4pt solid #d8dee9;padding-bottom:2mm;">
    <span><b style="color:#0b1c30;">ColdTrace</b> · Guion de exposición con evidencia visual</span>
    <span>Proyecto Integrador · 2026</span>
  </div>
</div>`;

const footer = `
<div style="width:100%;padding:0 16mm;font-family:'Segoe UI',Arial,sans-serif;font-size:7.5pt;color:#7b8794;">
  <div style="display:flex;justify-content:space-between;align-items:center;border-top:0.4pt solid #d8dee9;padding-top:2mm;">
    <span>ColdTrace — Monitoreo de cadena de frío</span>
    <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
  </div>
</div>`;

if (!fs.existsSync(htmlPath)) {
  throw new Error(`No existe el HTML del guion: ${htmlPath}`);
}

let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
}

const page = await browser.newPage({ viewport: { width: 1280, height: 1800 } });
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });

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

const opciones = {
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: header,
  footerTemplate: footer,
  margin: { top: '20mm', bottom: '16mm', left: '16mm', right: '16mm' },
  preferCSSPageSize: false,
};

fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
await page.pdf({ ...opciones, path: pdfPath });

if (fs.existsSync(path.dirname(destinoEscritorio))) {
  fs.copyFileSync(pdfPath, destinoEscritorio);
}

const kb = Math.round(fs.statSync(pdfPath).size / 1024);
const paginas = await page.evaluate(() => document.querySelectorAll('.section').length);
console.log(`PDF generado (${kb} kB, ${paginas} secciones):`);
console.log(`  ${pdfPath}`);
if (fs.existsSync(destinoEscritorio)) {
  console.log(`  ${destinoEscritorio}`);
}

await browser.close();
