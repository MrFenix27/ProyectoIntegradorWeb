import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '../../core/guards/auth.guard';
import { LogisticsComponent } from './logistics.component';

/** Módulo logístico: despachos y recepciones (solo ADMIN y USER). */
export const LOGISTICS_ROUTES: Routes = [
  {
    path: 'logistica',
    component: LogisticsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'USER'] },
  },
];
