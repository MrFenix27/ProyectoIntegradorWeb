import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-login',
  template: `
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0b1b2b;">
    <form (ngSubmit)="entrar()" style="background:#fff;padding:2rem;border-radius:12px;min-width:320px;display:flex;flex-direction:column;gap:0.75rem;">
      <h2 style="margin:0;">ColdTrace — Ingresar</h2>
      <small>Usa admin/admin123 · user/user123 · guest/guest123</small>
      <input [(ngModel)]="username" name="username" placeholder="Usuario" required
        style="padding:0.6rem;border:1px solid #ccc;border-radius:8px;">
      <input [(ngModel)]="password" name="password" type="password" placeholder="Contraseña" required
        style="padding:0.6rem;border:1px solid #ccc;border-radius:8px;">
      <button type="submit" style="padding:0.7rem;background:#0b6bcb;color:#fff;border:0;border-radius:8px;cursor:pointer;">
        Entrar
      </button>
      <p *ngIf="error" style="color:#c00;margin:0;">{{ error }}</p>
    </form>
  </div>`
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  username = 'admin';
  password = 'admin123';
  error = '';

  entrar() {
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => this.error = e?.error?.message ?? 'Credenciales inválidas o API no disponible'
    });
  }
}
