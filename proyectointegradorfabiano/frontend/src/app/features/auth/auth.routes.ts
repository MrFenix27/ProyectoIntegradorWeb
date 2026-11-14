import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';

/** Módulo de autenticación: única vista pública. */
export const AUTH_ROUTES: Routes = [{ path: 'login', component: LoginComponent }];
