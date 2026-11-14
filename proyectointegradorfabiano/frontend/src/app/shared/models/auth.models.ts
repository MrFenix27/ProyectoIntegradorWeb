/** Modelos de autenticación y roles. */

export interface AuthResponse {
  token: string;
  username: string;
  rol: string;
}

export type Rol = 'ADMIN' | 'USER' | 'GUEST';
