import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { TraceReportComponent } from './trace-report.component';

/** Módulo de trazabilidad: recorrido, telemetría y cumplimiento del lote. */
export const TRACEABILITY_ROUTES: Routes = [
  { path: 'trazabilidad', component: TraceReportComponent, canActivate: [authGuard] },
];
