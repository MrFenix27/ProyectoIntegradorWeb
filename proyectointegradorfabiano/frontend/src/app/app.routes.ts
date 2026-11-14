import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { DASHBOARD_ROUTES } from './features/dashboard/dashboard.routes';
import { LOTS_ROUTES } from './features/lots/lots.routes';
import { LOGISTICS_ROUTES } from './features/logistics/logistics.routes';
import { TRACEABILITY_ROUTES } from './features/traceability/traceability.routes';

/**
 * Rutas raíz de la aplicación. Cada módulo (feature) declara sus propias
 * rutas en su archivo `*.routes.ts`, y aquí solo se componen. Así, agregar
 * un módulo nuevo no obliga a editar la configuración de los demás.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  ...AUTH_ROUTES,
  ...DASHBOARD_ROUTES,
  ...LOTS_ROUTES,
  ...LOGISTICS_ROUTES,
  ...TRACEABILITY_ROUTES,
  { path: '**', redirectTo: 'dashboard' },
];
