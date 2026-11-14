import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthResponse, Rol } from '../../shared/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = '/api/auth';

  login(username: string, password: string) {
    return this.http.post<AuthResponse>(`${this.base}/login`, { username, password }).pipe(
      tap((res) => this.guardarSesion(res))
    );
  }

  register(username: string, password: string, rol = 'USER') {
    return this.http.post<AuthResponse>(`${this.base}/register`, { username, password, rol }).pipe(
      tap((res) => this.guardarSesion(res))
    );
  }

  private guardarSesion(res: AuthResponse) {
    localStorage.setItem('jwt', res.token);
    localStorage.setItem('username', res.username);
    localStorage.setItem('rol', res.rol);
  }

  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    localStorage.removeItem('rol');
    this.router.navigate(['/login']);
  }

  get token(): string | null {
    return localStorage.getItem('jwt');
  }

  get username(): string | null {
    return localStorage.getItem('username');
  }

  get rol(): string | null {
    return localStorage.getItem('rol');
  }

  get logueado(): boolean {
    return !!this.token;
  }

  /** Vista inicial según el rol autenticado. */
  get rutaInicio(): string {
    return this.tieneRol('GUEST') ? '/lotes' : '/dashboard';
  }

  /** ADMIN y USER pueden crear/editar; GUEST solo consulta. */
  get puedeEscribir(): boolean {
    return this.tieneRol('ADMIN', 'USER');
  }

  /** Solo ADMIN puede eliminar registros. */
  get esAdmin(): boolean {
    return this.tieneRol('ADMIN');
  }

  tieneRol(...roles: Rol[]): boolean {
    const actual = (this.rol ?? '').toUpperCase();
    return roles.includes(actual as Rol);
  }
}
