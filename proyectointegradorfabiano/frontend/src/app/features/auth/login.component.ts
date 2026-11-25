import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-login',
  template: `
    <div class="login-page">
      <form class="login-card" [formGroup]="form" (ngSubmit)="entrar()" novalidate>
        <div class="login-brand">
          <span class="material-symbols-outlined">ac_unit</span>
          <b>ColdTrace</b>
        </div>
        <h2>Ingresar</h2>
        <small>Monitoreo de cadena de frío · admin/admin123 · user/user123 · guest/guest123</small>

        <label class="login-field">
          Usuario
          <input
            type="text"
            formControlName="username"
            placeholder="Usuario"
            autocomplete="username"
            [class.campo-invalido]="invalido('username')"
          />
          <small class="field-error" *ngIf="invalido('username')">
            <ng-container *ngIf="form.get('username')?.hasError('required')">El usuario es obligatorio.</ng-container>
            <ng-container *ngIf="form.get('username')?.hasError('minlength')">Debe tener al menos 3 caracteres.</ng-container>
            <ng-container *ngIf="form.get('username')?.hasError('maxlength')">Máximo 30 caracteres.</ng-container>
          </small>
        </label>

        <label class="login-field">
          Contraseña
          <input
            type="password"
            formControlName="password"
            placeholder="Contraseña"
            autocomplete="current-password"
            [class.campo-invalido]="invalido('password')"
          />
          <small class="field-error" *ngIf="invalido('password')">
            <ng-container *ngIf="form.get('password')?.hasError('required')">La contraseña es obligatoria.</ng-container>
            <ng-container *ngIf="form.get('password')?.hasError('minlength')">Debe tener al menos 6 caracteres.</ng-container>
          </small>
        </label>

        <button type="submit" class="login-submit" [disabled]="form.invalid || enviando()">
          {{ enviando() ? 'Validando...' : 'Entrar' }}
        </button>

        <p class="login-error" *ngIf="error()">{{ error() }}</p>
      </form>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  enviando = signal(false);
  error = signal('');

  readonly form = this.fb.nonNullable.group({
    username: ['admin', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    password: ['admin123', [Validators.required, Validators.minLength(6)]],
  });

  invalido(campo: 'username' | 'password'): boolean {
    const control = this.form.get(campo)!;
    return control.invalid && (control.dirty || control.touched);
  }

  entrar(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue();
    this.enviando.set(true);

    this.auth.login(username, password).subscribe({
      next: () => {
        this.enviando.set(false);
        // Redirección según el tipo de usuario autenticado
        this.router.navigateByUrl(this.auth.rutaInicio);
      },
      error: (err) => {
        this.enviando.set(false);
        this.error.set(
          err?.status === 401 || err?.status === 403
            ? 'Credenciales inválidas.'
            : err?.error?.message ?? 'No se pudo conectar con la API. Inténtalo de nuevo en unos segundos.'
        );
      },
    });
  }
}
