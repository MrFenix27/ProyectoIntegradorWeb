import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Cierra la sesión cuando la API responde 401 por token ausente, inválido o expirado.
 * Un 403 se deja pasar para que la vista muestre el mensaje de permiso.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/api/auth')) {
        localStorage.removeItem('jwt');
        localStorage.removeItem('username');
        localStorage.removeItem('rol');

        if (router.url !== '/login') {
          void router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};
