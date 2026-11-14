import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { LotsComponent } from './lots.component';
import { ProductoDetalleComponent } from './producto-detalle.component';

/** Módulo de productos y lotes: lista, formulario y detalle. */
export const LOTS_ROUTES: Routes = [
  { path: 'lotes', component: LotsComponent, canActivate: [authGuard] },
  { path: 'productos/:id', component: ProductoDetalleComponent, canActivate: [authGuard] },
];
