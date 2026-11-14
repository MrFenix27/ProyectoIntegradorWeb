import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../../shared/models/auth.models';

/** Exige una sesión activa; si no hay token redirige al login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.logueado ? true : router.parseUrl('/login');
};

/**
 * Exige además un rol concreto. Se configura en la ruta:
 *   data: { roles: ['ADMIN', 'USER'] }
 * Si el rol no coincide, redirige a la vista inicial de ese rol.
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.logueado) {
    return router.parseUrl('/login');
  }

  const roles = (route.data['roles'] as Rol[] | undefined) ?? [];
  if (!roles.length || auth.tieneRol(...roles)) {
    return true;
  }

  return router.parseUrl(auth.rutaInicio);
};
