import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { DashboardComponent } from './dashboard.component';

/** Módulo del panel principal: indicadores y alertas térmicas. */
export const DASHBOARD_ROUTES: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
];
