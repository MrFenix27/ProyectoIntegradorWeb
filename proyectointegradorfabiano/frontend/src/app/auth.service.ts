import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export interface AuthResponse { token: string; username: string; rol: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = '/api/auth';

  login(username: string, password: string) {
    return this.http.post<AuthResponse>(`${this.base}/login`, { username, password }).pipe(
      tap(res => this.guardarSesion(res))
    );
  }

  register(username: string, password: string, rol = 'USER') {
    return this.http.post<AuthResponse>(`${this.base}/register`, { username, password, rol }).pipe(
      tap(res => this.guardarSesion(res))
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

  get token(): string | null { return localStorage.getItem('jwt'); }
  get username(): string | null { return localStorage.getItem('username'); }
  get rol(): string | null { return localStorage.getItem('rol'); }
  get logueado(): boolean { return !!this.token; }
}
