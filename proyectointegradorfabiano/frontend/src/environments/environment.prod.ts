/**
 * Configuracion de produccion (Vercel).
 *
 * `apiUrl` es la URL publica del backend en Render, SIN barra final.
 * Si Render te asigna otro subdominio, actualiza este valor y vuelve a
 * desplegar en Vercel. No es un secreto: las URLs publicas pueden ir en el repo.
 */
export const environment = {
  production: true,
  apiUrl: 'https://coldtrace-api.onrender.com',
};
