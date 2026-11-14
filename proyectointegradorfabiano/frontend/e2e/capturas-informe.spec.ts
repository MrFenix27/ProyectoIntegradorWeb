import { expect, test, type Page } from '@playwright/test';

/**
 * Capturas complementarias para el informe técnico:
 *   - Vista de trazabilidad con telemetría en vivo
 *   - Recepción de un despacho (PUT /api/operaciones/:id/recepcion)
 *
 * Crea su propio despacho para poder recepcionarlo, así es repetible.
 */
const EVIDENCIAS = '../docs/evidencias';

async function login(page: Page, usuario: string, clave: string): Promise<void> {
  await page.goto('/login');
  await page.locator('input[formcontrolname="username"]').fill(usuario);
  await page.locator('input[formcontrolname="password"]').fill(clave);
  await page.getByRole('button', { name: /Entrar|Validando/ }).click();
}

async function captura(page: Page, archivo: string): Promise<void> {
  await page.addStyleTag({
    content:
      '.sidebar{position:absolute !important;bottom:auto !important}.topbar{position:absolute !important}',
  });
  await page.evaluate(() => {
    const sidebar = document.querySelector('.sidebar') as HTMLElement | null;
    if (sidebar) {
      sidebar.style.height = `${document.documentElement.scrollHeight}px`;
    }
  });
  await page.screenshot({ path: `${EVIDENCIAS}/${archivo}`, fullPage: true });
}

test('Capturas: trazabilidad y recepción', async ({ page }) => {
  const manifiesto = `MF-INF-${Date.now().toString().slice(-5)}`;

  await login(page, 'admin', 'admin123');
  await expect(page).toHaveURL(/\/dashboard/);

  // ---------- Crear un despacho propio ----------
  await page.goto('/logistica');
  await expect(page.getByRole('heading', { name: 'Operaciones logísticas' })).toBeVisible();
  await page.locator('input[formcontrolname="manifiesto"]').fill(manifiesto);
  await page.locator('select[formcontrolname="loteId"]').selectOption({ index: 1 });
  await page.locator('input[formcontrolname="vehiculo"]').fill('TRK-INFO');
  await page.locator('input[formcontrolname="conductor"]').fill('Inspector Informe');
  await page.locator('input[formcontrolname="precooling"][value="Verificado"]').check();
  await page.locator('input[formcontrolname="destino"]').fill('Centro de distribución norte');
  await page.getByRole('button', { name: 'Inicializar despacho' }).click();
  await expect(page.locator('.form-message')).toContainText('registrado con operación');

  // ---------- Trazabilidad ----------
  await page.goto('/trazabilidad');
  await expect(page.getByRole('heading', { name: 'Reporte de trazabilidad' })).toBeVisible();
  await page.locator('.telemetry-chart svg polyline').waitFor({ state: 'attached' });
  await page.waitForTimeout(4500); // deja correr la telemetría "en vivo"
  await captura(page, '11-trazabilidad.png');

  // ---------- Recepción del despacho recién creado ----------
  await page.goto('/logistica');
  const selector = page.locator('select[formcontrolname="operacionId"]');
  const opcion = selector.locator('option', { hasText: manifiesto });
  await expect(opcion).toHaveCount(1);
  const valor = await opcion.getAttribute('value');
  await selector.selectOption(valor!);

  await page.locator('input[formcontrolname="temperatura"]').fill('4.3');
  await page.locator('select[formcontrolname="logger"]').selectOption({ label: 'Normal (sin alertas)' });
  await page.locator('input[formcontrolname="sello"]').check();
  await page.locator('input[formcontrolname="dano"]').check();
  await page.locator('textarea[formcontrolname="firma"]').fill('Recepción conforme — Inspector Informe');
  await page.getByRole('button', { name: 'Completar recepción' }).click();

  await expect(page.locator('.form-message')).toContainText('Recepción registrada');
  await captura(page, '12-recepcion.png');
});
