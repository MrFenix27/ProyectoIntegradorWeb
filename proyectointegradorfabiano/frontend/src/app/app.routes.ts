import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { LogisticsComponent } from './logistics.component';
import { LotsComponent } from './lots.component';
import { TraceReportComponent } from './trace-report.component';
import { LoginComponent } from './login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
	{ path: 'lotes', component: LotsComponent, canActivate: [authGuard] },
	{ path: 'logistica', component: LogisticsComponent, canActivate: [authGuard] },
	{ path: 'trazabilidad', component: TraceReportComponent, canActivate: [authGuard] },
	{ path: '**', redirectTo: 'dashboard' },
];
