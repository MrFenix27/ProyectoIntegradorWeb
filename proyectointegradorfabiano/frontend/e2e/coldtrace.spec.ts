import { expect, test, type Page } from '@playwright/test';

/**
 * Flujo funcional completo de ColdTrace probado desde el navegador.
 * Cada test guarda capturas en docs/evidencias/ como evidencia del avance.
 */
const EVIDENCIAS = '../docs/evidencias';

async function login(page: Page, usuario: string, clave: string): Promise<void> {
  await page.goto('/login');
  await page.locator('input[formcontrolname="username"]').fill(usuario);
  await page.locator('input[formcontrolname="password"]').fill(clave);
  await page.getByRole('button', { name: /Entrar|Validando/ }).click();
}

function filaProducto(page: Page, texto: string) {
  return page.locator('section.lot-table').first().locator('tbody tr', { hasText: texto });
}

/**
 * Captura de pantalla completa. Los elementos `position: fixed` (sidebar y
 * topbar) se convierten a `absolute` para que no se dupliquen ni se desplacen
 * al fotografiar toda la página.
 */
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

test.describe.configure({ mode: 'serial' });

test('1. Login ADMIN redirige al panel principal con KPIs de la API', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Ingresar' })).toBeVisible();
  await captura(page, '01-login.png');

  await page.locator('input[formcontrolname="username"]').fill('admin');
  await page.locator('input[formcontrolname="password"]').fill('admin123');
  await page.getByRole('button', { name: /Entrar|Validando/ }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Resumen ejecutivo' })).toBeVisible();
  await expect(page.locator('.kpis article').first()).toContainText('LOTES REGISTRADOS');
  // El KPI debe mostrar un número real proveniente de la API, sin depender del seed exacto.
  await expect(page.locator('.kpis article').first().locator('strong')).toHaveText(/^\d+$/);
  await expect(page.locator('.user')).toContainText('admin');
  await expect(page.locator('.user')).toContainText('ADMIN');

  await captura(page, '02-dashboard-admin.png');
});

test('2. Credenciales inválidas muestran mensaje de error en el login', async ({ page }) => {
  await login(page, 'admin', 'clave-incorrecta');

  await expect(page.locator('.login-error')).toBeVisible();
  await expect(page.locator('.login-error')).toContainText('Credenciales inválidas');
  await expect(page).toHaveURL(/\/login/);

  await captura(page, '03-login-error.png');
});

test('3. Validaciones de formulario: campo requerido, longitud y rango térmico', async ({ page }) => {
  await login(page, 'admin', 'admin123');
  await expect(page).toHaveURL(/\/dashboard/);
  await page.goto('/lotes');
  await expect(page.getByRole('heading', { name: 'Lotes y productos' })).toBeVisible();

  const nombre = page.locator('.product-fields input[formcontrolname="nombre"]');
  await nombre.fill('ab');
  await nombre.blur();
  await expect(page.locator('.product-fields .field-error').first()).toContainText('Mínimo 3 caracteres');

  await nombre.fill('');
  await nombre.blur();
  await expect(page.locator('.product-fields .field-error').first()).toContainText('El nombre es obligatorio');

  // Validación cruzada: máxima debe ser mayor que mínima
  await page.locator('input[formcontrolname="temperaturaMinima"]').fill('10');
  await page.locator('input[formcontrolname="temperaturaMaxima"]').fill('5');
  await page.locator('input[formcontrolname="temperaturaMaxima"]').blur();
  await expect(page.locator('.product-fields')).toContainText('Debe ser mayor que la temperatura mínima');

  await captura(page, '04-validaciones-formulario.png');
});

test('4. Flujo CRUD completo: alta, detalle, edición y eliminación de producto', async ({ page }) => {
  const sufijo = Date.now().toString().slice(-6);
  const nombre = `E2E-Vacuna-${sufijo}`;
  const nombreEditado = `${nombre}-EDIT`;

  await login(page, 'admin', 'admin123');
  await expect(page).toHaveURL(/\/dashboard/);
  await page.goto('/lotes');
  await expect(page.getByRole('heading', { name: 'Lotes y productos' })).toBeVisible();

  // ---------- CREATE ----------
  await page.locator('.product-fields input[formcontrolname="nombre"]').fill(nombre);
  await page.locator('.product-fields input[formcontrolname="tipo"]').fill('Biologico');
  await page.locator('input[formcontrolname="temperaturaMinima"]').fill('2');
  await page.locator('input[formcontrolname="temperaturaMaxima"]').fill('8');
  await page.locator('input[formcontrolname="vidaUtilDias"]').fill('45');
  await page.getByRole('button', { name: 'Registrar producto' }).click();

  await expect(page.locator('.form-message')).toContainText('registrado correctamente');
  await expect(filaProducto(page, nombre)).toBeVisible();
  await captura(page, '05-alta-producto.png');

  // ---------- DETAIL (ruta /productos/:id) ----------
  // Se abre el detalle de un producto del seed para mostrar sus lotes asociados
  await filaProducto(page, 'Vacuna Tipo A').getByRole('button', { name: 'Ver' }).click();
  await expect(page).toHaveURL(/\/productos\/\d+/);
  await expect(page.getByRole('heading', { name: 'Detalle de producto' })).toBeVisible();
  await expect(page.locator('.manifest')).toContainText('Vacuna Tipo A');
  await expect(page.locator('.manifest')).toContainText('2°C a 8°C');
  await expect(page.locator('table')).toContainText('VAX-789');
  await captura(page, '06-detalle-producto.png');

  // ---------- UPDATE ----------
  await page.getByRole('link', { name: /Volver a lotes/ }).click();
  await expect(page.getByRole('heading', { name: 'Lotes y productos' })).toBeVisible();
  await filaProducto(page, nombre).getByRole('button', { name: 'Editar' }).click();
  await expect(page.locator('.product-form h2')).toContainText('Editar producto');
  await page.locator('.product-fields input[formcontrolname="nombre"]').fill(nombreEditado);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();

  await expect(page.locator('.form-message')).toContainText('actualizado correctamente');
  await expect(filaProducto(page, nombreEditado)).toBeVisible();
  await captura(page, '07-edicion-producto.png');

  // ---------- DELETE ----------
  page.once('dialog', (dialog) => dialog.accept());
  await filaProducto(page, nombreEditado).getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.locator('.form-message')).toContainText('eliminado');
  await expect(filaProducto(page, nombreEditado)).toHaveCount(0);
  await captura(page, '08-eliminacion-producto.png');
});

test('5. Registrar despacho logístico y verlo en tránsito (POST + tabla)', async ({ page }) => {
  const manifiesto = `MF-E2E-${Date.now().toString().slice(-4)}`;

  await login(page, 'admin', 'admin123');
  await expect(page).toHaveURL(/\/dashboard/);
  await page.goto('/logistica');
  await expect(page.getByRole('heading', { name: 'Operaciones logísticas' })).toBeVisible();

  await page.locator('input[formcontrolname="manifiesto"]').fill(manifiesto);
  await page.locator('select[formcontrolname="loteId"]').selectOption({ index: 1 });
  await page.locator('input[formcontrolname="vehiculo"]').fill('TRK-999');
  await page.locator('input[formcontrolname="conductor"]').fill('Inspector E2E');
  await page.locator('input[formcontrolname="precooling"][value="Verificado"]').check();
  await page.locator('input[formcontrolname="destino"]').fill('Centro de distribución sur');
  await page.getByRole('button', { name: 'Inicializar despacho' }).click();

  await expect(page.locator('.form-message')).toContainText('registrado con operación');
  await expect(page.locator('table', { hasText: manifiesto }).first()).toBeVisible();
  await captura(page, '09-despacho-logistico.png');
});

test('6. Rol GUEST: redirección a lotes, sin formularios de escritura ni módulo logística', async ({ page }) => {
  await login(page, 'guest', 'guest123');

  // Redirección según tipo de usuario
  await expect(page).toHaveURL(/\/lotes/);
  await expect(page.locator('.guest-note')).toContainText('GUEST');
  await expect(page.locator('.product-form')).toHaveCount(0);
  await expect(page.locator('nav a', { hasText: 'Logística' })).toHaveCount(0);
  // Pero sí puede consultar la tabla de productos
  await expect(page.locator('section.lot-table').first()).toContainText('Vacuna Tipo A');

  await captura(page, '10-rol-guest-solo-lectura.png');
});
